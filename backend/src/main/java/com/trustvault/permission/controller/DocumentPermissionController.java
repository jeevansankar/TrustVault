
package com.trustvault.permission.controller;

import com.trustvault.document.dto.DocumentResponse;
import com.trustvault.document.service.DocumentService;
import com.trustvault.permission.dto.PermissionResponse;
import com.trustvault.permission.dto.ShareDocumentRequest;
import com.trustvault.permission.service.DocumentPermissionService;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents/{documentId}/permissions")
public class DocumentPermissionController {

    private final DocumentService documentService;
    private final DocumentPermissionService permissionService;
    private final UserRepository userRepository;

    public DocumentPermissionController(
            DocumentPermissionService permissionService,
            UserRepository userRepository,
            DocumentService documentService) {

        this.permissionService = permissionService;
        this.userRepository = userRepository;
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> shareDocument(
            @PathVariable Long documentId,
            @Valid @RequestBody ShareDocumentRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        PermissionResponse response = permissionService.shareDocument(
                documentId,
                request,
                user
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getPermissions(
            @PathVariable Long documentId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                permissionService.getDocumentPermissions(
                        documentId,
                        user
                )
        );
    }

    @DeleteMapping("/{permissionId}")
    public ResponseEntity<Void> revokePermission(
            @PathVariable Long documentId,
            @PathVariable Long permissionId,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        permissionService.revokePermission(
                documentId,
                permissionId,
                user
        );

        return ResponseEntity.noContent().build();
    }

  

    private User getAuthenticatedUser(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        // JWT subject and Authentication.getName() contain the username.
        String username = authentication.getName();

        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new AccessDeniedException(
                        "Authenticated user was not found"
                ));
    }
}
/*
1. Why you're getting 403 Forbidden
Your JwtService creates the JWT using the username as its subject:
.subject(username)


But your permissions controller currently does this:
String email = authentication.getName();

return userRepository.findByEmailIgnoreCase(email)
    .orElseThrow(() ->
        new AccessDeniedException("Authenticated user was not found"));


Here, authentication.getName() returns the username,
 but your controller searches for that value as an email address. The lookup can fail, causing AccessDeniedException and the 403 response.

Your working DocumentController already uses the correct approach: findByUsernameIgnoreCase(). */