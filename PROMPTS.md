# TrustVault — AI Prompt Log

## Introduction

I used ChatGPT and Claude as development assistants while building TrustVault, a secure document management platform using React, Java Spring Boot, and MySQL. I used them for implementation guidance, debugging, security reviews, and cloud deployment. I reviewed and tested suggestions rather than assuming AI-generated solutions were correct.

## Entry 1 — Application Architecture and Integration

- **Date:** 2026-10-19
- **AI tool:** ChatGPT
- **Prompt:** Help me develop TrustVault using React, Spring Boot, and MySQL while preserving the existing application structure and functionality.
- **AI output:** Provided implementation guidance for frontend/backend integration and application structure.
- **What needed attention:** Suggested changes needed to be checked against the existing project and actual backend endpoints.
- **What I did:** Continued working with the existing application and checked integration against the actual API configuration.
- **Verification:** Review the relevant source changes and link the actual Git commit here.

## Entry 2 — Authentication and Backend Security

- **Date:** 2026-10-20
- **AI tool:** ChatGPT
- **Prompt:** Help troubleshoot Spring Security authentication and authorization while preserving the existing login flow.
- **AI output:** Suggested security configuration and debugging steps.
- **What needed attention:** Security configuration changes could affect existing authentication and protected endpoints if applied without checking the current setup.
- **What I did:** Reviewed the existing Spring Security configuration and investigated the actual backend response and logs before deciding what to change.
- **Verification:** Link the actual authentication-related commit and record the tests performed.

## Entry 3 — Document Integrity and Database Schema

- **Date:** 2026-10-22
- **AI tool:** ChatGPT
- **Prompt:** Help investigate document integrity verification and database schema validation errors in TrustVault.
- **AI output:** Provided debugging guidance for the document entity and database schema.
- **What was wrong:** Hibernate schema validation identified that the `integrity_hash` column expected by the entity was missing from the existing database migration.
- **What I did:** Identified the schema mismatch and prepared a Flyway migration to add the nullable `integrity_hash` column. I then rebuilt the backend and investigated deployment issues.
- **Verification:** Link the actual migration commit and confirm the final deployed schema.

## Entry 4 — AWS Deployment and HTTPS

- **Date:** 2026-10-24
- **AI tool:** ChatGPT
- **Prompt:** Help deploy the Spring Boot backend on AWS EC2 and configure a domain, HTTPS, and HTTP-to-HTTPS redirection without changing application functionality.
- **AI output:** Provided deployment, networking, and reverse-proxy configuration guidance.
- **What needed attention:** Cloud connectivity and deployment settings required verification against the actual EC2 instance, security group, and application configuration.
- **What I did:** Investigated connectivity and deployment settings, configured the Caddy reverse proxy, and checked the deployed HTTPS endpoint.
- **Verification:** Link the actual deployment-related commit, if applicable, and retain evidence of the successful HTTPS and redirect tests.

## Entry 5 — Production Login Troubleshooting

- **Date:** 2026-10-25
- **AI tool:** ChatGPT
- **Prompt:** Diagnose a failed login request on the deployed TrustVault frontend using Chrome DevTools Network details and the backend's JSON response.
- **AI output:** Helped interpret the `401 Unauthorized` response and distinguish authentication failure from connectivity problems.
- **What needed attention:** A `401` response alone does not prove a deployment defect or identify the precise cause.
- **What I did:** Checked the request URL, HTTP status, response body, and request details. I identified that the login attempt used an incorrect password and understood why the backend rejected it.
- **Verification:** Confirm successful login with the correct credentials without recording passwords or authentication tokens.

## Reusable AI Instructions

- Preserve existing application functionality unless a change is necessary.
- Check the actual source code, API endpoints, and logs before recommending fixes.
- Evaluate document authorization on the backend, not only through frontend visibility.
- Never expose passwords, JWTs, OTPs, or production secrets in logs or public repositories.
- Treat security claims as unverified until supported by code review and testing.
- Distinguish implemented features from proposed improvements and unfinished work.

## Evidence and Limitations

This log summarizes the development activities described for TrustVault. Before submission, verify the dates and descriptions against the actual development history, replace commit-link placeholders with real GitHub commit URLs, and add the exact AI mistakes and corrections supported by the conversation or code history.

Do not claim a security test passed unless it was executed and the result was verified.