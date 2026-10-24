
package com.trustvault.document.repository;

import com.trustvault.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findAllByOwner_IdOrderByCreatedAtDesc(Long ownerId);

    Optional<Document> findByIdAndOwner_Id(Long id, Long ownerId);

    boolean existsByStorageKey(String storageKey);
}
/*
Method	Purpose
findAllByOwner_IdOrderByCreatedAtDesc()	Lists a user's documents, newest first
findByIdAndOwner_Id()	Finds a document only when its ID and owner ID match
existsByStorageKey()	Checks whether a storage key already exists */