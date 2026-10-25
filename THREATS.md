# TrustVault — Security Threat Analysis

## 1. Purpose

TrustVault is a secure document management platform built with React, Java Spring Boot, and MySQL. This document identifies potential attacks, security measures, and risks that require further verification.

## 2. Threats and Mitigations

### Threat 1: Unauthorized Document Access
- **Risk:** A user accesses another user's private document.
- **Mitigation:** Enforce document ownership and permission checks on the backend for every document operation.
- **Verification needed:** Test access using multiple user accounts and direct API requests.

### Threat 2: IDOR (Insecure Direct Object Reference)
- **Risk:** An attacker changes a document ID in an API request to access another document.
- **Mitigation:** Verify the requesting user's authorization for the specific document on every request.
- **Verification needed:** Test modified document IDs across upload, download, view, and delete endpoints.

### Threat 3: Access After Permission Revocation
- **Risk:** A recipient continues accessing a document after their permission is removed.
- **Mitigation:** Check current permissions on every protected request rather than relying on stale permissions.
- **Verification needed:** Revoke access and immediately retry the recipient's previous requests.

### Threat 4: Authentication Attacks
- **Risk:** Attackers attempt unauthorized logins or misuse authentication tokens.
- **Mitigation:** Use Spring Security, JWT authentication, email OTP verification, and password recovery controls.
- **Verification needed:** Test invalid credentials, expired tokens, and unauthorized API requests.

### Threat 5: Malicious File Uploads
- **Risk:** An attacker uploads executable files, oversized files, or content disguised as an allowed file type.
- **Mitigation:** Validate file type and size on the server and store uploaded files outside publicly accessible directories.
- **Verification needed:** Test invalid file types, oversized uploads, and attempts to access storage directly.

### Threat 6: Audit Log Tampering
- **Risk:** An attacker modifies or deletes audit records to hide document activity.
- **Mitigation:** Restrict access to audit records and consider append-only storage, integrity verification, and restricted database privileges.
- **Verification needed:** Confirm that application users cannot modify or delete audit records and assess protection against privileged database access.

### Threat 7: Sensitive Information Exposure
- **Risk:** Database credentials, JWT secrets, email credentials, or confidential files become publicly accessible.
- **Mitigation:** Use environment-based secrets, HTTPS, restricted CORS configuration, and private file storage.
- **Verification needed:** Review repository history, deployment configuration, file access routes, and secret exposure.

### Threat 8: Unauthorized Document Sharing
- **Risk:** A document is shared with the wrong recipient or a recipient receives editing access unintentionally.
- **Mitigation:** Bind permissions to specific users and documents and enforce them on the backend.
- **Verification needed:** Test view-only access, unauthorized edits, incorrect recipients, and permission changes.

### Threat 9: Denied Access Attempts Are Not Recorded
- **Risk:** Security investigations cannot identify attempts to access restricted documents.
- **Mitigation:** Record relevant denied access attempts without exposing passwords, tokens, or sensitive document contents.
- **Verification needed:** Confirm that rejected requests generate useful, protected audit events.

### Threat 10: Document Deletion and Recovery
- **Risk:** Accidental or malicious deletion causes permanent data loss.
- **Mitigation:** Evaluate backups, retention policies, and recovery procedures for document files and database metadata.
- **Verification needed:** Perform a recovery test. Database backups alone may not recover files stored separately.

## 3. Known Gaps

The following areas require completion or further verification:
- A dedicated administrator dashboard for user and document activity.
- Comprehensive audit coverage, including denied access attempts.
- Automated authorization tests for cross-user document access.
- Immediate access revocation tests.
- Document-file backup and recovery procedures.
- Verification of audit log integrity and protection against tampering.

## 4. Testing Principles

Security testing should include:
- User A attempting to access User B's documents.
- Requests with altered document IDs.
- Access attempts after permissions are revoked.
- Missing, invalid, and expired authentication tokens.
- Attempts to download, edit, or delete documents without permission.
- Attempts to modify or delete audit records.
- Invalid and oversized file uploads.

Only verified test results should be reported as successful.

## 5. Accepted Risks

Until the relevant controls are implemented and tested, unauthorized access, incomplete audit coverage, audit tampering, and inadequate recovery remain risks. TrustVault should not be considered fully security-validated until these gaps are addressed and tested.

## 6. Conclusion

TrustVault applies security controls to document management, but security depends on server-side authorization, reliable audit records, effective permission revocation, and repeatable automated tests. This document will be updated as controls are implemented and verified.