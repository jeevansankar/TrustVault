
package com.trustvault.document.dto;

import com.trustvault.document.entity.Document;

import java.time.LocalDateTime;

public record DocumentUploadResponse(
        Long id,
        String originalFilename,
        String contentType,
        Long fileSize,
        LocalDateTime createdAt,
        String message
) {

    public static DocumentUploadResponse from(Document document) {
        return new DocumentUploadResponse(
                document.getId(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSize(),
                document.getCreatedAt(),
                "Document uploaded successfully"
        );
    }
}
/*
. Understand the code
- DocumentUploadResponse represents the upload result.
- id is the document's database ID.
- originalFilename, contentType, and fileSize describe the uploaded file.
- createdAt records when the document was created.
- message gives the frontend a success message.
- from(Document document) converts the saved database entity into the response DTO.
{
  "id": 12,
  "originalFilename": "certificate.pdf",
  "contentType": "application/pdf",
  "fileSize": 245760,
  "createdAt": "2026-10-23T14:30:00",
  "message": "Document uploaded successfully"
} */
