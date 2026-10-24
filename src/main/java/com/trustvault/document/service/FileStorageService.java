package com.trustvault.document.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageLocation;

    public FileStorageService(
            @Qualifier("documentStorageLocation") Path storageLocation) {
        this.storageLocation = storageLocation;
    }

    public String store(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot store an empty file"
            );
        }

        String storageKey = UUID.randomUUID().toString();

        Path targetPath = storageLocation.resolve(storageKey).normalize();

        if (!targetPath.startsWith(storageLocation)) {
            throw new SecurityException("Invalid storage path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath);
        }

        return storageKey;
    }

    public Path getExistingFile(String storageKey) throws IOException {

        validateStorageKey(storageKey);

        Path filePath = storageLocation.resolve(storageKey).normalize();

        if (!filePath.startsWith(storageLocation)
                || !Files.isRegularFile(filePath)) {
            throw new IOException("Stored document not found");
        }

        return filePath;
    }

    public void delete(String storageKey) throws IOException {

        Path filePath = getExistingFile(storageKey);

        Files.delete(filePath);
    }

    private void validateStorageKey(String storageKey) {

        try {
            UUID.fromString(storageKey);
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new IllegalArgumentException(
                    "Invalid storage key"
            );
        }
    }
}
