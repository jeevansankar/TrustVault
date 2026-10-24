
package com.trustvault.document.dto;

import com.trustvault.document.entity.Document;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        String originalFilename,
        String contentType,
        Long fileSize,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static DocumentResponse from(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSize(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}
/*
What does this file do?
- record DocumentResponse defines a compact, immutable data object.
- id identifies the document in the API.
- originalFilename is the name displayed to the user.
- contentType tells the frontend whether the file is a PDF, PNG, or JPEG.
- fileSize gives the file size in bytes.
- createdAt and updatedAt provide timestamps.
- from(Document document) converts the database entity into a safe response object.
Important security detail: We intentionally do not return storageKey. 
The frontend should never need to know the internal filename used to store a private document. */