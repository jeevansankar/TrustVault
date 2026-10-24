
CREATE TABLE document_permissions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    permission_level VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT uk_document_permission_recipient
        UNIQUE (document_id, recipient_id),

    CONSTRAINT fk_permission_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permission_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_permission_recipient
    ON document_permissions(recipient_id);

CREATE INDEX idx_permission_document
    ON document_permissions(document_id);
