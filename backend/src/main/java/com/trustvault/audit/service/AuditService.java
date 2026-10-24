
package com.trustvault.audit.service;

import com.trustvault.audit.entity.AuditLog;
import com.trustvault.audit.repository.AuditLogRepository;
import com.trustvault.user.entity.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void recordEvent(
            User actor,
            String action,
            String resourceType,
            String resourceId,
            String outcome,
            String details,
            String ipAddress) {

        AuditLog log = new AuditLog();

        log.setActor(actor);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setOutcome(outcome);
        log.setDetails(details);
        log.setIpAddress(ipAddress);

        log.setCreatedAt(
                LocalDateTime.now().truncatedTo(ChronoUnit.MICROS)
        );

        String previousHash = auditLogRepository
                .findTopByOrderByIdDesc()
                .map(AuditLog::getEventHash)
                .orElse(null);

        log.setPreviousHash(previousHash);

        // Calculate the event hash before saving.
        // The current hash calculation does not depend on the database ID.
        log.setEventHash(calculateHash(log));

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getEventsForUser(Long userId) {
        return auditLogRepository
                .findAllByActor_IdOrderByIdDesc(userId);
    }

    @Transactional(readOnly = true)
    public boolean verifyIntegrity() {

        List<AuditLog> logs =
                auditLogRepository.findAllByOrderByIdAsc();

        String expectedPreviousHash = null;

        for (AuditLog log : logs) {

            // Invalid or incomplete records fail verification.
            if (log == null
                    || log.getCreatedAt() == null
                    || log.getEventHash() == null) {
                return false;
            }

            // Verify the link to the previous record.
            if (!Objects.equals(
                    log.getPreviousHash(),
                    expectedPreviousHash)) {
                return false;
            }

            // Recalculate the hash from the stored event fields.
            String expectedHash;

            try {
                expectedHash = calculateHash(log);
            } catch (RuntimeException exception) {
                return false;
            }

            // Verify the stored hash matches the calculated hash.
            if (!MessageDigest.isEqual(
                    expectedHash.getBytes(StandardCharsets.UTF_8),
                    log.getEventHash().getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            // The next record must reference this record's hash.
            expectedPreviousHash = log.getEventHash();
        }

        return true;
    }

    private String calculateHash(AuditLog log) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            update(digest, log.getActor() == null
                    ? null
                    : String.valueOf(log.getActor().getId()));

            update(digest, log.getAction());
            update(digest, log.getResourceType());
            update(digest, log.getResourceId());
            update(digest, log.getOutcome());
            update(digest, log.getDetails());
            update(digest, log.getIpAddress());
            update(digest, log.getCreatedAt().toString());
            update(digest, log.getPreviousHash());

            byte[] hash = digest.digest();

            StringBuilder hex = new StringBuilder();

            for (byte value : hash) {
                hex.append(String.format("%02x", value & 0xff));
            }

            return hex.toString();

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable", exception);
        }
    }

    private void update(MessageDigest digest, String value) {

        if (value == null) {
            digest.update(
                    ByteBuffer.allocate(Integer.BYTES)
                            .putInt(-1)
                            .array()
            );
            return;
        }

        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);

        digest.update(
                ByteBuffer.allocate(Integer.BYTES)
                        .putInt(bytes.length)
                        .array()
        );

        digest.update(bytes);
    }
}
