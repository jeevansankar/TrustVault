
package com.trustvault.permission.dto;

import com.trustvault.permission.entity.DocumentPermission;
import com.trustvault.permission.entity.PermissionLevel;

import java.time.LocalDateTime;

public record PermissionResponse(
        Long id,
        Long documentId,
        Long recipientId,
        String recipientEmail,
        PermissionLevel permissionLevel,
        LocalDateTime createdAt
) {

    public static PermissionResponse from(
            DocumentPermission permission) {

        return new PermissionResponse(
                permission.getId(),
                permission.getDocument().getId(),
                permission.getRecipient().getId(),
                permission.getRecipient().getEmail(),
                permission.getPermissionLevel(),
                permission.getCreatedAt()
        );
    }
}
