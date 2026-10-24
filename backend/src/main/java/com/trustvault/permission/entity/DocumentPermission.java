
package com.trustvault.permission.entity;

import com.trustvault.document.entity.Document;
import com.trustvault.user.entity.User;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "document_permissions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_document_permission_recipient",
            columnNames = {"document_id", "recipient_id"}
        )
    }
)
public class DocumentPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_level", nullable = false, length = 20)
    private PermissionLevel permissionLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DocumentPermission() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public PermissionLevel getPermissionLevel() {
        return permissionLevel;
    }

    public void setPermissionLevel(PermissionLevel permissionLevel) {
        this.permissionLevel = permissionLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
/*
Understand the important parts
- @ManyToOne: connects each permission to one document and one recipient.
- @JoinColumn: defines the foreign-key columns document_id and recipient_id.
- @Enumerated(EnumType.STRING): stores VIEW as readable text rather than a numeric enum position.
- @PrePersist: automatically sets the creation timestamp.
- @UniqueConstraint: prevents duplicate permission records for the same document and recipient.
For example, if user A shares certificate.pdf with user B, the database stores a permission linking
 that document to user B. User B's access must still be checked on every protected request.

Important: Your Flyway migration V5__create_document_permissions.sql must use the same column names
 and types as this entity. If that migration already exists, don't edit an applied migration casually; 
 we'll verify its schema before running the application. */