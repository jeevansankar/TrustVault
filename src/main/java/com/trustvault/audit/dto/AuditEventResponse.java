
package com.trustvault.audit.dto;

import com.trustvault.audit.entity.AuditLog;
import java.time.LocalDateTime;

public record AuditEventResponse(
        Long id,
        Long actorId,
        String action,
        String resourceType,
        String resourceId,
        String outcome,
        String details,
        LocalDateTime createdAt,
        String eventHash
) {

    public static AuditEventResponse from(AuditLog log) {
        return new AuditEventResponse(
                log.getId(),
                log.getActor() == null
                        ? null
                        : log.getActor().getId(),
                log.getAction(),
                log.getResourceType(),
                log.getResourceId(),
                log.getOutcome(),
                log.getDetails(),
                log.getCreatedAt(),
                log.getEventHash()
        );
    }
}
