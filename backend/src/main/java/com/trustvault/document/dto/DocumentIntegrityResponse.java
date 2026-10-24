
package com.trustvault.document.dto;

public record DocumentIntegrityResponse(
        Long documentId,
        String filename,
        String status,
        boolean verified,
        String expectedHash,
        String actualHash,
        String message
) {
}
