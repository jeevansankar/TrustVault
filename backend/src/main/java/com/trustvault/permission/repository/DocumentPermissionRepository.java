
package com.trustvault.permission.repository;

import com.trustvault.permission.entity.DocumentPermission;
import com.trustvault.permission.entity.PermissionLevel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentPermissionRepository
        extends JpaRepository<DocumentPermission, Long> {

    Optional<DocumentPermission> findByDocument_IdAndRecipient_Id(
            Long documentId,
            Long recipientId
    );

    List<DocumentPermission> findAllByDocument_IdOrderByCreatedAtDesc(
            Long documentId
    );

    List<DocumentPermission> findAllByRecipient_IdOrderByCreatedAtDesc(
            Long recipientId
    );

    boolean existsByDocument_IdAndRecipient_IdAndPermissionLevel(
            Long documentId,
            Long recipientId,
            PermissionLevel permissionLevel
    );

   Optional<DocumentPermission> findByIdAndDocument_Id(
        Long permissionId,
        Long documentId
        );

    void deleteByDocument_IdAndRecipient_Id(
            Long documentId,
            Long recipientId
    );
}
/*

Method	Purpose
findByDocument_IdAndRecipient_Id	Find a specific user's permission for a document
findAllByDocument_IdOrderByCreatedAtDesc	List permissions granted for a document
findAllByRecipient_IdOrderByCreatedAtDesc	List permissions received by a user
existsByDocument_IdAndRecipient_IdAndPermissionLevel	Check whether a specific permission exists
deleteByDocument_IdAndRecipient_Id	Remove a user's permission for a document */