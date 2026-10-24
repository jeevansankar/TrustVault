
package com.trustvault.audit.controller;

import com.trustvault.audit.dto.AuditEventResponse;
import com.trustvault.audit.service.AuditService;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final AuditService auditService;
    private final UserRepository userRepository;

    public AuditController(
            AuditService auditService,
            UserRepository userRepository) {
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<AuditEventResponse>> getMyEvents(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        List<AuditEventResponse> events = auditService
                .getEventsForUser(user.getId())
                .stream()
                .map(AuditEventResponse::from)
                .toList();

        return ResponseEntity.ok(events);
    }

    @GetMapping("/integrity")
    public ResponseEntity<IntegrityResponse> checkIntegrity() {

        boolean valid = auditService.verifyIntegrity();

        return ResponseEntity.ok(
                new IntegrityResponse(
                        valid,
                        valid
                                ? "Audit chain is valid"
                                : "Audit chain integrity check failed"
                )
        );
    }

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        // JWT subject contains the username, not the email.
        String username = authentication.getName();

        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }

    public record IntegrityResponse(
            boolean valid,
            String message) {
    }
}
