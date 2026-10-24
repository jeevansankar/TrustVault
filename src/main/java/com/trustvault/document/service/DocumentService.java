
package com.trustvault.document.service;

import com.trustvault.audit.service.AuditService;
import com.trustvault.document.dto.DocumentIntegrityResponse;
import com.trustvault.document.entity.Document;
import com.trustvault.document.repository.DocumentRepository;
import com.trustvault.permission.entity.PermissionLevel;
import com.trustvault.permission.repository.DocumentPermissionRepository;
import com.trustvault.user.entity.User;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository permissionRepository;
    private final FileStorageService fileStorageService;
    private final DocumentValidationService documentValidationService;
    private final AuditService auditService;

    public DocumentService(
            DocumentRepository documentRepository,
            DocumentPermissionRepository permissionRepository,
            FileStorageService fileStorageService,
            DocumentValidationService documentValidationService,
            AuditService auditService) {

        this.documentRepository = documentRepository;
        this.permissionRepository = permissionRepository;
        this.fileStorageService = fileStorageService;
        this.documentValidationService = documentValidationService;
        this.auditService = auditService;
    }

    @Transactional(rollbackFor = Exception.class)
    public Document uploadDocument(
            MultipartFile file,
            User authenticatedUser) throws IOException {

        validateAuthenticatedUser(authenticatedUser);
        documentValidationService.validate(file);

        String storageKey = fileStorageService.store(file);

        try {
            // Hash the actual stored bytes, not the filename or metadata.
            Path storedPath = fileStorageService.getExistingFile(storageKey);
            String integrityHash = calculateSha256(storedPath);

            Document document = new Document();
            document.setOwner(authenticatedUser);
            document.setOriginalFilename(file.getOriginalFilename());
            document.setStorageKey(storageKey);
            document.setContentType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setIntegrityHash(integrityHash);

            Document savedDocument = documentRepository.save(document);

            auditService.recordEvent(
                    authenticatedUser,
                    "DOCUMENT_UPLOAD",
                    "DOCUMENT",
                    String.valueOf(savedDocument.getId()),
                    "SUCCESS",
                    "Document uploaded with SHA-256 integrity baseline",
                    null
            );

            return savedDocument;

        } catch (IOException | RuntimeException exception) {
            try {
                fileStorageService.delete(storageKey);
            } catch (IOException cleanupException) {
                exception.addSuppressed(cleanupException);
            }

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public List<Document> getMyDocuments(User authenticatedUser) {

        validateAuthenticatedUser(authenticatedUser);

        return documentRepository.findAllByOwner_IdOrderByCreatedAtDesc(
                authenticatedUser.getId()
        );
    }

    @Transactional(readOnly = true)
    public Document getDocumentMetadata(
            Long documentId,
            User authenticatedUser) {

        validateAuthenticatedUser(authenticatedUser);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        // The owner always has access to their document.
        if (document.getOwner().getId().equals(authenticatedUser.getId())) {
            return document;
        }

        // Non-owners must have an active VIEW permission.
        boolean canView = permissionRepository
                .existsByDocument_IdAndRecipient_IdAndPermissionLevel(
                        documentId,
                        authenticatedUser.getId(),
                        PermissionLevel.VIEW
                );

        if (!canView) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document not found"
            );
        }

        return document;
    }

    @Transactional(rollbackFor = Exception.class)
    public DocumentIntegrityResponse verifyDocumentIntegrity(
            Long documentId,
            User authenticatedUser) {

        // Reuse the existing ownership and VIEW-permission checks.
        Document document = getDocumentMetadata(
                documentId,
                authenticatedUser
        );

        String expectedHash = document.getIntegrityHash();
        String actualHash;

        try {
            Path storedPath = fileStorageService.getExistingFile(
                    document.getStorageKey()
            );

            actualHash = calculateSha256(storedPath);

        } catch (IOException exception) {
            auditService.recordEvent(
                    authenticatedUser,
                    "DOCUMENT_INTEGRITY_CHECK",
                    "DOCUMENT",
                    String.valueOf(documentId),
                    "FAILURE",
                    "Stored document file is missing or cannot be read",
                    null
            );

            return new DocumentIntegrityResponse(
                    documentId,
                    document.getOriginalFilename(),
                    "FILE_MISSING",
                    false,
                    expectedHash,
                    null,
                    "The stored file could not be found or read."
            );
        }

        // Older documents may not have a trusted baseline hash.
        // Never silently create a new baseline during verification.
        if (expectedHash == null || expectedHash.isBlank()) {

            auditService.recordEvent(
                    authenticatedUser,
                    "DOCUMENT_INTEGRITY_CHECK",
                    "DOCUMENT",
                    String.valueOf(documentId),
                    "FAILURE",
                    "No trusted SHA-256 baseline exists for this document",
                    null
            );

            return new DocumentIntegrityResponse(
                    documentId,
                    document.getOriginalFilename(),
                    "BASELINE_MISSING",
                    false,
                    null,
                    actualHash,
                    "No trusted baseline exists. The document cannot yet be verified."
            );
        }

        boolean matches = MessageDigest.isEqual(
                expectedHash.getBytes(java.nio.charset.StandardCharsets.US_ASCII),
                actualHash.getBytes(java.nio.charset.StandardCharsets.US_ASCII)
        );

        String status = matches ? "VERIFIED" : "INTEGRITY_MISMATCH";
        String outcome = matches ? "SUCCESS" : "FAILURE";
        String message = matches
                ? "Document integrity verified. The file matches its saved SHA-256 hash."
                : "Integrity mismatch detected. The file differs from its saved SHA-256 hash.";

        auditService.recordEvent(
                authenticatedUser,
                "DOCUMENT_INTEGRITY_CHECK",
                "DOCUMENT",
                String.valueOf(documentId),
                outcome,
                message,
                null
        );

        return new DocumentIntegrityResponse(
                documentId,
                document.getOriginalFilename(),
                status,
                matches,
                expectedHash,
                actualHash,
                message
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteDocument(
            Long documentId,
            User authenticatedUser) throws IOException {

        validateAuthenticatedUser(authenticatedUser);

        // Deletion remains owner-only.
        Document document = documentRepository.findByIdAndOwner_Id(
                        documentId,
                        authenticatedUser.getId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        documentRepository.delete(document);
        fileStorageService.delete(document.getStorageKey());

        auditService.recordEvent(
                authenticatedUser,
                "DOCUMENT_DELETE",
                "DOCUMENT",
                String.valueOf(documentId),
                "SUCCESS",
                "Document deleted",
                null
        );
    }

    @Transactional(readOnly = true)
    public List<Document> getSharedDocuments(User authenticatedUser) {

        validateAuthenticatedUser(authenticatedUser);

        return permissionRepository
                .findAllByRecipient_IdOrderByCreatedAtDesc(
                        authenticatedUser.getId()
                )
                .stream()
                .filter(permission ->
                        permission.getPermissionLevel() == PermissionLevel.VIEW)
                .map(permission -> permission.getDocument())
                .filter(document ->
                        !document.getOwner().getId()
                                .equals(authenticatedUser.getId()))
                .toList();
    }

    private String calculateSha256(Path path) throws IOException {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            try (InputStream input = Files.newInputStream(path)) {
                byte[] buffer = new byte[8192];
                int bytesRead;

                while ((bytesRead = input.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }

            return HexFormat.of().formatHex(digest.digest());

        } catch (NoSuchAlgorithmException exception) {
            // SHA-256 is required by Java; this indicates a runtime problem.
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    exception
            );
        }
    }

    private void validateAuthenticatedUser(User user) {

        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }
    }
}


/*
2. Understand the responsibilities
Method	Purpose
uploadDocument()	Validates a file, stores its bytes, and saves its metadata
getMyDocuments()	Lists documents owned by the authenticated user
getDocumentMetadata()	Retrieves metadata only when the user owns that document
deleteDocument()	Deletes the owned document's database record and physical file
validateAuthenticatedUser()	Rejects missing users or users without an ID

The important change is getDocumentMetadata().

Previously, it only searched for a document owned by the authenticated user. Now it:
1. Finds the document.
2. Checks whether the authenticated user owns it.
3. If not, checks whether the user has a VIEW permission.
4. Returns the document only if one of those checks succeeds.*/