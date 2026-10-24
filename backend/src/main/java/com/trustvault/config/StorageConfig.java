
package com.trustvault.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class StorageConfig {

    @Bean
    public Path documentStorageLocation(
            @Value("${trustvault.storage.location:./private-storage}")
            String storageLocation) {

        Path path = Path.of(storageLocation)
                .toAbsolutePath()//Converts a relative path into an absolute path based on the application's current working directory.
                .normalize();//Removes unnecessary path elements such as . and resolves straightforward .. segments where possible.
                //Creates a Java Path object representing the specified location.

        try {
            Files.createDirectories(path);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not initialize private document storage",
                    exception
            );
        }

        return path;
    }
}
/*
3. What does this file do?
- @Configuration tells Spring that this class provides application configuration.
- @Bean registers the storage path as a Spring-managed object.
- @Value(...) reads the storage directory from your configuration. If you haven’t configured it, the default is ./private-storage.
- Path.of(...).toAbsolutePath().normalize() converts the configured location into a normalized absolute path.
- Files.createDirectories(path) creates the directory if it doesn't exist.
- If storage initialization fails, the application receives a clear startup error instead of silently continuing. 

Class or component	Responsibility
StorageConfig	Prepares and exposes the storage location
FileStorageService	Will perform file operations
DocumentService	Will coordinate document operations and authorization
DocumentController	Will receive HTTP requests*/
