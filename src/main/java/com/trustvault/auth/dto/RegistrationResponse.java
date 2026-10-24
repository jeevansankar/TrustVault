
package com.trustvault.auth.dto;

public record RegistrationResponse(
    Long userId,
    String username,
    String accountStatus,
    String message
) {}
