# 🔐 TrustVault — Secure Document Management System

**Secure document sharing. User-specific access. File integrity verification.**

TrustVault is a full-stack document management platform built with **React, Java Spring Boot, and MySQL**. It enables users to upload and download documents, share specific documents with selected users, and control access through backend security checks.

🌐 **Live Application:** https://trustvault-app-k8a4.onrender.com  
⚙️ **Backend API:** https://trustvault-api.duckdns.org  
💻 **GitHub Repository:** https://github.com/jeevansankar/TrustVault

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Implemented Features](#-implemented-features)
4. [Technology Stack](#-technology-stack)
5. [System Architecture](#-system-architecture)
6. [Document Sharing Workflow](#-document-sharing-workflow)
7. [Security Design](#-security-design)
8. [Local Setup Prerequisites](#-local-setup-prerequisites)
9. [Database Configuration](#-database-configuration)
10. [Backend Setup](#-backend-setup)
11. [Frontend Setup](#-frontend-setup)
12. [Environment Configuration](#-environment-configuration)
13. [Demo Accounts](#-demo-accounts)
14. [Testing the Application](#-testing-the-application)
15. [Database and File Storage](#-database-and-file-storage)
16. [Cloud Deployment](#-cloud-deployment)
17. [Threat Analysis](#-threat-analysis)
18. [AI-Assisted Development](#-ai-assisted-development)
19. [Current Limitations](#-current-limitations)
20. [Future Work](#-future-work)
21. [Author](#-author)

---

## 🎯 Project Overview

TrustVault focuses on an important security problem: **ensuring that documents are shared only with their intended recipients**.

Unlike a basic file-upload application, TrustVault combines authentication, document management, user-specific sharing, backend authorization, file integrity hashing, and security-related logging.

The project was developed using React for the user interface, Java Spring Boot for backend APIs, and MySQL for persistent application data.

## 🚨 Problem Statement

Confidential documents can be exposed when access permissions are too broad, shared documents are accessible to the wrong users, or security-related activity cannot be investigated.

TrustVault addresses this problem by providing:

- 🔑 User authentication and email verification.
- 📂 Document upload and download.
- 👥 Sharing with a specific registered user.
- 🔒 View-only sharing for recipients.
- 🛡️ Backend security controls.
- 🔏 SHA-256 file integrity hash support.
- 🧾 Security-related activity logging.

The goal is to make document sharing more controlled, traceable, and security-conscious.

---

## ✨ Implemented Features

### 🔑 1. Authentication and Account Security

- User registration.
- Email OTP verification.
- JWT-based authentication.
- Password recovery functionality.
- Spring Security integration.

### 📂 2. Document Management

- Upload documents.
- View and manage personal documents.
- Download documents.
- Store document metadata.

### 🤝 3. User-Specific Document Sharing

- Share a particular document with a selected user.
- Allow the intended recipient to view and download shared documents.
- Provide view-only sharing rather than document editing.
- Use backend authorization for protected document operations.

### 🔏 4. File Integrity Support

- SHA-256 file integrity hash support.
- Hashes can be used to help detect changes to document contents.

### 🧾 5. Security-Related Logging

- Application security-related activity logging.
- A foundation for investigating document operations and access-related events.

### ☁️ 6. Cloud Deployment

- React frontend deployed on Render.
- Java Spring Boot backend deployed on AWS EC2.
- MySQL database hosted on Amazon RDS.
- DuckDNS domain configuration and Caddy reverse proxy for HTTPS.

---

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Java 21, Spring Boot |
| Build tool | Maven Wrapper |
| Authentication | JWT |
| Security framework | Spring Security |
| Database | MySQL |
| Database migrations | Flyway, if enabled in the configuration |
| File integrity | SHA-256 |
| Email verification | Email OTP integration |
| Frontend hosting | Render |
| Backend hosting | AWS EC2 |
| Database hosting | Amazon RDS for MySQL |
| Domain and HTTPS | DuckDNS, Caddy |
| Version control | Git, GitHub |

---

## 🏗️ System Architecture

```text
                   USER / BROWSER
                         |
                         v
                  REACT + VITE
                    FRONTEND
                     (Render)
                         |
                      HTTPS
                         |
                         v
                 JAVA SPRING BOOT
                     BACKEND
                    (AWS EC2)
                         |
              +----------+----------+
              |                     |
              v                     v
       SPRING SECURITY          AMAZON RDS
       JWT AUTHENTICATION       MySQL Database
              |
              v
       DOCUMENT ACCESS
        AUTHORIZATION
              |
              v
       BACKEND-MANAGED
        FILE STORAGE
```

**Architecture overview:**

- React provides the user interface.
- Spring Boot handles authentication, APIs, and document operations.
- Spring Security and JWT support protected access.
- MySQL stores application data and document metadata.
- The backend manages uploaded document files in its configured storage location.

Database backups do not automatically include files stored separately on the backend.

---

## 🔐 Document Sharing Workflow

1. A user registers and signs in.
2. The document owner uploads a document.
3. The owner selects a particular user to share the document with.
4. The intended recipient can view and download the shared document.
5. View-only sharing is intended to prevent the recipient from editing the document.
6. Protected document requests are handled by the backend.
7. The owner can revoke sharing permission; subsequent access must be checked against the updated permission.

**Important security principle:** Hiding a frontend button is not enough. The backend must enforce permissions for every protected document operation.

---

## 🛡️ Security Design

TrustVault incorporates the following security mechanisms:

- **Authentication:** JWT-based authentication and Spring Security.
- **Access control:** User-specific document sharing and backend authorization.
- **Transport security:** HTTPS for the deployed application.
- **Secret management:** Environment-based configuration for sensitive settings.
- **Integrity support:** SHA-256 hashes for supported file-integrity checks.
- **Activity logging:** Security-related logging provided by the application.

Comprehensive authorization testing, full audit coverage, and audit-log tamper resistance require further verification and improvement.

See [THREATS.md](THREATS.md) for the project's threat analysis.

---

## 💻 Local Setup Prerequisites

Install the following software:

- Java JDK 21
- Git
- Node.js LTS
- npm
- MySQL Server

Verify the installations in your terminal:

```bash
java -version
git --version
node -v
npm -v
mysql --version
```

---

## 📥 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/jeevansankar/TrustVault.git
cd TrustVault
```

The project contains separate `backend` and `frontend` directories.

---

## 🗄️ 2. Database Configuration

Start your local MySQL Server and create the database:

```sql
CREATE DATABASE trustvault;
```

Check the backend configuration in:

```text
backend/src/main/resources/application.properties
```

Configure the database URL, username, and password according to the application's actual configuration.

If Flyway is enabled, its configured migration scripts can create or update the database schema during application startup.

---

## ⚙️ 3. Environment Configuration

Configure the backend's required settings before starting it.

These may include:

- MySQL connection details.
- Email-provider credentials for OTP verification and password recovery.
- JWT signing secret.
- OTP security configuration.
- Private document storage path.

**Important:** Use the exact property names and environment-variable names expected by the backend code.

Spring Boot does not automatically load every `.env` file. Follow the configuration mechanism used by this project.

Never commit real database passwords, email credentials, JWT secrets, or other production secrets to GitHub.

---

## ☕ 4. Start the Spring Boot Backend

Open a terminal in the repository root.

### Windows PowerShell

```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
java -jar target\trustvault-0.0.1-SNAPSHOT.jar
```

### macOS / Linux

```bash
cd backend
chmod +x mvnw
./mvnw clean package -DskipTests
java -jar target/trustvault-0.0.1-SNAPSHOT.jar
```

Wait for Spring Boot to start successfully. Keep this terminal running.

If the backend fails to start, check the error message for database connectivity, missing configuration, or schema migration issues.

> `-DskipTests` skips test execution during packaging. It does not prove that the application has passed automated security tests.

---

## ⚛️ 5. Start the React Frontend

Open a **second terminal** from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite displays the local frontend URL in the terminal. It is commonly:

http://localhost:5173

Open that URL in your browser.

Ensure the frontend API configuration points to your local Spring Boot backend when testing locally. Do not leave it pointing to the deployed API if you intend to test the local backend.

---

## ✅ 6. Verify the Application

After starting MySQL, the backend, and the frontend, check the following:

- MySQL is running and the backend connects successfully.
- Spring Boot starts without configuration or database errors.
- The frontend communicates with the intended backend API.
- Registration, login, and email verification work with valid configuration.
- Document upload and download work.
- Sharing with a particular user works.
- The recipient can access the shared document according to the granted permission.
- Password recovery works when the email provider is correctly configured.

These are manual verification steps. They do not replace a comprehensive automated security test suite.

---

## 🧪 Demo Accounts

Use these accounts to demonstrate the document-sharing workflow, provided they can currently sign in to the deployed application.

| Purpose | Account email |
|---|---|
| Document owner | `vankamallamohith@gmail.com` |
| Sharing recipient | `jeevansankarchallagundla@gmail.com` |

### Suggested demonstration

1. Sign in as the document owner.
2. Upload a sample document.
3. Share it with the recipient's registered email.
4. Sign in as the recipient.
5. Verify that the recipient can view and download the shared document.
6. Check that view-only sharing does not permit document editing.
7. Revoke sharing permission and verify that subsequent protected requests are denied.

Passwords are intentionally not included in this public README. Provide dedicated test credentials to evaluators through a private channel. Do not use personal passwords as public demo credentials.

---

## 🗄️ Database and File Storage

TrustVault uses MySQL to store persistent application data.

In the deployed architecture:

- Amazon RDS hosts the MySQL database.
- The backend manages uploaded document files separately from database records.
- RDS backup settings protect the database according to the configured backup and retention policy.

**Important:** A database backup does not automatically back up document files stored on the backend server. Separate file backup and recovery procedures are required to recover lost or deleted documents.

---

## ☁️ Cloud Deployment

The deployed architecture uses the following services:

| Component | Service |
|---|---|
| Frontend | Render |
| Backend | AWS EC2 |
| Database | Amazon RDS for MySQL |
| Domain configuration | DuckDNS |
| HTTPS reverse proxy | Caddy |

### Live links

- **Application:** https://trustvault-app-k8a4.onrender.com
- **Backend API domain:** https://trustvault-api.duckdns.org
- **GitHub repository:** https://github.com/jeevansankar/TrustVault

Successful operation depends on the correct configuration of database connectivity, environment variables, email delivery, CORS, and frontend API settings.

---

## 🧠 Threat Analysis

The repository includes [THREATS.md](THREATS.md), which documents security risks and mitigation considerations.

Important threat scenarios include:

- Unauthorized access to another user's document.
- Direct API requests attempting to bypass frontend restrictions.
- Attempts to access a document after permission revocation.
- Attempts to edit or delete a view-only shared document.
- Exposure of database credentials or signing secrets.
- Incomplete recording or tampering with audit events.
- Unexpected or unsafe uploaded file types.
- Loss of uploaded files and incomplete recovery.

Threat analysis should be supported by tests that demonstrate whether the corresponding protections work.

---

## 🤖 AI-Assisted Development

AI tools used during development:

- ChatGPT
- Claude

They assisted with coding, debugging, security configuration reviews, interface design, and deployment troubleshooting.

AI-generated suggestions were reviewed against application logs, configuration, and actual runtime behaviour rather than being accepted without verification.

See [PROMPTS.md](PROMPTS.md) for the AI development record, including prompts, observed issues, corrections, and relevant commit links.

---

## ⚠️ Current Limitations

The core document workflows include uploading, downloading, and user-specific view-only sharing. The following areas still require implementation or further verification:

- Comprehensive audit tracking for every required document event.
- Automated security tests covering unauthorized cross-user access and document operations.
- Stronger verification of immediate access revocation across protected endpoints.
- Tamper-resistant audit records.
- Complete endpoint-by-endpoint API authorization documentation.
- A tested backup and recovery process for uploaded document files.

The project does not currently include a dedicated administrator dashboard.

---

## 🚀 Future Work

Planned improvements include:

1. **Administrator dashboard** — Provide a dedicated view of user activity, document sharing, permission changes, and security events.
2. **Advanced document search** — Add or expand search and filtering by document name, owner, category, and date.
3. **Complete audit trail** — Track uploads, views, downloads, changes, deletions, permission changes, and denied access attempts.
4. **Automated security testing** — Add integration tests for unauthorized reads, downloads, modifications, deletions, and access revocation.
5. **Audit-log integrity** — Strengthen protection against unauthorized alteration of audit records.
6. **API documentation** — Document every endpoint, authentication requirement, permission rule, and error response.
7. **File backup and recovery** — Implement and test recovery of document files independently of database backups.
8. **Threat coverage** — Map documented threats to automated tests and record accepted risks.
9. **Evaluation setup** — Improve reproducible setup instructions and provide dedicated test accounts and sample documents.

These improvements will help bring TrustVault closer to the full security and auditability requirements of a production-oriented document management platform.

---

## 👨‍💻 Author

**Challagundla Jeevan Sankar**

**Project:** TrustVault — Secure Document Management System

**GitHub:** https://github.com/jeevansankar/TrustVault

---

*TrustVault was developed for the Snovasys Fresher Hiring Challenge 2026. This README distinguishes implemented functionality from areas planned for future development.*
