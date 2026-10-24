package com.trustvault.verification.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Index;

@Entity
@Table(
    name = "otp_challenges",
    indexes = {
        @Index(name = "idx_otp_user_channel", columnList = "user_id, channel")
    }
)
public class OtpChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OtpChannel channel;

    @Column(name = "code_hash", nullable = false, length = 255)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private boolean consumed = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
     @Column(name = "purpose", nullable = false, length = 30)
     private OtpPurpose purpose = OtpPurpose.REGISTRATION;

     public OtpPurpose getPurpose() {
            return purpose;
    }

        public void setPurpose(OtpPurpose purpose) {
            this.purpose = purpose;
        }

    public OtpChallenge() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public OtpChannel getChannel() {
        return channel;
    }

    public void setChannel(OtpChannel channel) {
        this.channel = channel;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public boolean isConsumed() {
        return consumed;
    }

    public void setConsumed(boolean consumed) {
        this.consumed = consumed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
/*
Field	    Purpose
userId	    Identifies the user requesting verification
channel	    Separates email OTP from phone OTP
codeHash	Stores a hash of the OTP, not the raw code
expiresAt	Sets the deadline for verification
attempts	Counts incorrect attempts
consumed	Prevents successful reuse of an OTP
createdAt	Records when the challenge was created 

We store userId as a numeric field for this initial version.
The service will verify that the user exists before creating a challenge.

Security requirement: OTPs must be short-lived, limited to a small number of attempts, and single-use.

 Because a six-digit OTP has low entropy, its hash should be protected against 
 offline guessing; we'll use a keyed HMAC for stored OTP values in the service rather than relying 
 on an ordinary unsalted SHA-256 hash.*/