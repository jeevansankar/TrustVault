
package com.trustvault.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Username is required")
        @Size(max = 50)
        String identifier,

        @NotBlank(message = "Password is required")
        @Size(max = 72)
        String password

) {}
