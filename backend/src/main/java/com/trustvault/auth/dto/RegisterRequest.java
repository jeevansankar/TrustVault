
package com.trustvault.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3 to 50 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9_.-]+$",
        message = "Username can contain letters, numbers, underscores, dots and hyphens"
    )
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 254, message = "Email is too long")
    String email,

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^\\+[1-9]\\d{7,14}$",
        message = "Enter a valid international phone number, such as +919876543210"
    )
    String phoneNumber,

    @NotBlank(message = "Password is required")
    @Size(
        min = 12,
        max = 72,
        message = "Password must be between 12 and 72 characters"
    )
    String password

) {}
