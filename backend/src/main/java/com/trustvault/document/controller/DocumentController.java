
package com.trustvault.document.controller;

import com.trustvault.audit.service.AuditService;
import com.trustvault.document.dto.DocumentIntegrityResponse;
import com.trustvault.document.dto.DocumentResponse;
import com.trustvault.document.dto.DocumentUploadResponse;
import com.trustvault.document.entity.Document;
import com.trustvault.document.service.DocumentService;
import com.trustvault.document.service.FileStorageService;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DocumentController(
            DocumentService documentService,
            FileStorageService fileStorageService,
            UserRepository userRepository,
            AuditService auditService) {

        this.documentService = documentService;
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        User user = getAuthenticatedUser(authentication);

        Document document = documentService.uploadDocument(file, user);

        return ResponseEntity
                .status(201)
                .body(DocumentUploadResponse.from(document));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        List<DocumentResponse> documents = documentService
                .getMyDocuments(user)
                .stream()
                .map(DocumentResponse::from)
                .toList();

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<DocumentResponse>> getSharedDocuments(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        List<DocumentResponse> documents = documentService
                .getSharedDocuments(user)
                .stream()
                .map(DocumentResponse::from)
                .toList();

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentMetadata(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Document document = documentService
                .getDocumentMetadata(id, user);

        return ResponseEntity.ok(DocumentResponse.from(document));
    }

    // Verify the stored file against its trusted SHA-256 baseline.
    @GetMapping("/{id}/integrity")
    public ResponseEntity<DocumentIntegrityResponse> verifyIntegrity(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        DocumentIntegrityResponse result =
                documentService.verifyDocumentIntegrity(id, user);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            Authentication authentication) throws IOException {

        User user = getAuthenticatedUser(authentication);

        Document document = documentService
                .getDocumentMetadata(id, user);

        Path filePath = fileStorageService
                .getExistingFile(document.getStorageKey());

        FileSystemResource resource = new FileSystemResource(filePath);

        ContentDisposition contentDisposition = ContentDisposition
                .attachment()
                .filename(document.getOriginalFilename())
                .build();

        auditService.recordEvent(
                user,
                "DOCUMENT_DOWNLOAD",
                "DOCUMENT",
                String.valueOf(id),
                "SUCCESS",
                "Document download prepared",
                null
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(document.getFileSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                )
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            Authentication authentication) throws IOException {

        User user = getAuthenticatedUser(authentication);

        documentService.deleteDocument(id, user);

        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        // JWT subject contains the username, not the email.
        String username = authentication.getName();

        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new AccessDeniedException(
                        "Authenticated user was not found"
                ));
    }
}
