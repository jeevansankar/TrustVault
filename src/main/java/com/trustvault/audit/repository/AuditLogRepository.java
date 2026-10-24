package com.trustvault.audit.repository;

import com.trustvault.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    @EntityGraph(attributePaths = "actor")
    List<AuditLog> findAllByActor_IdOrderByIdDesc(Long actorId);

    Optional<AuditLog> findTopByOrderByIdDesc();

    List<AuditLog> findAllByOrderByIdAsc();
}