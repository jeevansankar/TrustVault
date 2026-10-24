CREATE TABLE audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    actor_id BIGINT NULL,
    action VARCHAR(60) NOT NULL,
    resource_type VARCHAR(60) NOT NULL,
    resource_id VARCHAR(100) NULL,
    outcome VARCHAR(20) NOT NULL,
    details VARCHAR(1000) NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME(6) NOT NULL,
    previous_hash CHAR(64) NULL,
    event_hash CHAR(64) NOT NULL,

    PRIMARY KEY (id),

    INDEX idx_audit_actor_created (actor_id, created_at),
    INDEX idx_audit_resource (resource_type, resource_id),
    INDEX idx_audit_created (created_at),

    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);