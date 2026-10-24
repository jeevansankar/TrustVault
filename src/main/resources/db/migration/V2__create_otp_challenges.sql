CREATE TABLE otp_challenges (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    channel VARCHAR(10) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,

    CONSTRAINT pk_otp_challenges
        PRIMARY KEY (id),

    CONSTRAINT fk_otp_challenges_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_otp_channel
        CHECK (channel IN ('EMAIL', 'PHONE')),

    INDEX idx_otp_user_channel (user_id, channel)
);