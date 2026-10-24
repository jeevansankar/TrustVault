
package com.trustvault.permission.service;

import com.trustvault.audit.service.AuditService;
import com.trustvault.document.entity.Document;
import com.trustvault.document.repository.DocumentRepository;
import com.trustvault.permission.dto.PermissionResponse;
import com.trustvault.permission.dto.ShareDocumentRequest;
import com.trustvault.permission.entity.DocumentPermission;
import com.trustvault.permission.entity.PermissionLevel;
import com.trustvault.permission.repository.DocumentPermissionRepository;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class DocumentPermissionService {

    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DocumentPermissionService(
            DocumentRepository documentRepository,
            DocumentPermissionRepository permissionRepository,
            UserRepository userRepository,
        AuditService auditService) {

        this.documentRepository = documentRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.auditService=auditService;
    }

    @Transactional
    public PermissionResponse shareDocument(
            Long documentId,
            ShareDocumentRequest request,
            User authenticatedUser) {

        validateAuthenticatedUser(authenticatedUser);

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Share request is required"
            );
        }

        Document document = findOwnedDocument(
                documentId,
                authenticatedUser
        );

        String recipientEmail = request.recipientEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        User recipient = userRepository.findByEmailIgnoreCase(recipientEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Recipient account was not found"
                ));

        if (recipient.getId().equals(authenticatedUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot share a document with yourself"
            );
        }

        if (request.permissionLevel() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Permission level is required"
            );
        }

        if (request.permissionLevel() != PermissionLevel.VIEW) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported permission level"
            );
        }

        boolean alreadyShared =
                permissionRepository
                        .findByDocument_IdAndRecipient_Id(
                                documentId,
                                recipient.getId()
                        )
                        .isPresent();

        if (alreadyShared) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This document is already shared with that user"
            );
        }

        DocumentPermission permission = new DocumentPermission();

        permission.setDocument(document);
        permission.setRecipient(recipient);
        permission.setPermissionLevel(request.permissionLevel());

        DocumentPermission savedPermission =
                permissionRepository.save(permission);
//we develop audit succes

             auditService.recordEvent(
                authenticatedUser,
                "DOCUMENT_SHARE",
                "DOCUMENT",
                String.valueOf(documentId),
                "SUCCESS",
                "Document shared with recipient",
                null
        );

        return PermissionResponse.from(savedPermission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getDocumentPermissions(
            Long documentId,
            User authenticatedUser) {

        validateAuthenticatedUser(authenticatedUser);

        // Only the document owner can see the sharing list.
        findOwnedDocument(documentId, authenticatedUser);

        return permissionRepository
                .findAllByDocument_IdOrderByCreatedAtDesc(documentId)
                .stream()
                .map(PermissionResponse::from)
                .toList();
    }

@Transactional
public void revokePermission(
        Long documentId,
        Long permissionId,
        User authenticatedUser) {

    validateAuthenticatedUser(authenticatedUser);

    // Only the owner can revoke access.
    findOwnedDocument(documentId, authenticatedUser);

    // Ensure the permission belongs to this specific document.
    DocumentPermission permission = permissionRepository
            .findByIdAndDocument_Id(permissionId, documentId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Permission not found for this document"
            ));

    permissionRepository.delete(permission);
    //event save b
    auditService.recordEvent(
        authenticatedUser,
        "PERMISSION_REVOKE",
        "DOCUMENT_PERMISSION",
        String.valueOf(permissionId),
        "SUCCESS",
        "Document permission revoked",
        null
);
}


    private Document findOwnedDocument(
            Long documentId,
            User authenticatedUser) {

        return documentRepository
                .findByIdAndOwner_Id(
                        documentId,
                        authenticatedUser.getId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));
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
Method	Endpoint	Purpose
POST	/api/v1/documents/{id}/permissions	Share a document
GET	/api/v1/documents/{id}/permissions	List sharing permissions
DELETE	/api/v1/documents/{id}/permissions/{permissionId}	Revoke access */