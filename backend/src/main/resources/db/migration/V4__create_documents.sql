CREATE TABLE documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,

    original_filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(100) NOT NULL,
    content_type VARCHAR(150) NOT NULL,
    file_size BIGINT NOT NULL,

    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),

    CONSTRAINT uk_documents_storage_key
        UNIQUE (storage_key),

    CONSTRAINT fk_documents_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    INDEX idx_documents_owner_created (owner_id, created_at)
);
/*
What the columns mean:
Column	Purpose
id	Unique document record ID
owner_id	User who owns the document
original_filename	Filename shown to the user
storage_key	Random internal identifier used to locate the file
content_type	Expected file type, such as application/pdf
file_size	File size in bytes
created_at	Upload timestamp
updated_at	Last metadata update timestamp
*/