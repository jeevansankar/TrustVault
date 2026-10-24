
package com.trustvault.document.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;

@Service
public class DocumentValidationService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "pdf", "application/pdf",
            "png", "image/png",
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg"
    );

    private final long maxFileSizeBytes;

    public DocumentValidationService(
            @Value("${trustvault.storage.max-file-size-bytes:10485760}")
            long maxFileSizeBytes) {

        if (maxFileSizeBytes <= 0) {
            throw new IllegalArgumentException(
                    "Maximum file size must be greater than zero"
            );
        }

        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public void validate(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a non-empty file"
            );
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(
                    "File exceeds the maximum allowed size"
            );
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null
                || originalFilename.isBlank()
                || originalFilename.contains("/")
                || originalFilename.contains("\\")
                || originalFilename.indexOf('\0') >= 0) {

            throw new IllegalArgumentException(
                    "Invalid filename"
            );
        }

        int dotIndex = originalFilename.lastIndexOf('.');

        if (dotIndex <= 0 || dotIndex == originalFilename.length() - 1) {
            throw new IllegalArgumentException(
                    "File must have an allowed extension"
            );
        }

        String extension = originalFilename
                .substring(dotIndex + 1)
                .toLowerCase(Locale.ROOT);

        String expectedContentType = ALLOWED_TYPES.get(extension);

        if (expectedContentType == null) {
            throw new IllegalArgumentException(
                    "Unsupported file extension"
            );
        }

        String declaredContentType = file.getContentType();

        if (declaredContentType == null
                || !expectedContentType.equalsIgnoreCase(
                        declaredContentType.trim())) {

            throw new IllegalArgumentException(
                    "File extension and content type do not match"
            );
        }

        if (!hasValidSignature(file, extension)) {
            throw new IllegalArgumentException(
                    "File content does not match its declared type"
            );
        }
    }

    private boolean hasValidSignature(
            MultipartFile file,
            String extension) throws IOException {

        try (InputStream inputStream = file.getInputStream()) {

            byte[] header = inputStream.readNBytes(8);

            switch (extension) {

                case "pdf":
                    return header.length >= 5
                            && header[0] == '%'
                            && header[1] == 'P'
                            && header[2] == 'D'
                            && header[3] == 'F'
                            && header[4] == '-';

                case "png":
                    return header.length >= 8
                            && (header[0] & 0xFF) == 0x89
                            && header[1] == 'P'
                            && header[2] == 'N'
                            && header[3] == 'G'
                            && header[4] == 0x0D
                            && header[5] == 0x0A
                            && header[6] == 0x1A
                            && header[7] == 0x0A;

                case "jpg":
                case "jpeg":
                    return header.length >= 3
                            && (header[0] & 0xFF) == 0xFF
                            && (header[1] & 0xFF) == 0xD8
                            && (header[2] & 0xFF) == 0xFF;

                default:
                    return false;
            }
        }
    }
}
