
package com.trustvault.permission.dto;

import com.trustvault.permission.entity.PermissionLevel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ShareDocumentRequest(

        @NotBlank(message = "Recipient email is required")
        @Email(message = "Please provide a valid email address")
        @Size(max = 254, message = "Email address is too long")
        String recipientEmail,

        @NotNull(message = "Permission level is required")
        PermissionLevel permissionLevel

) {
}
