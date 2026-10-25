# 🔐 TrustVault — Secure Document Management System

**Secure document sharing. Controlled access. File integrity verification. Security auditability.**

TrustVault is a full-stack document management platform built to help users store, download, and share documents with specific people while protecting access through backend authorization.

🌐 **Live Application:** https://trustvault-app-k8a4.onrender.com  
⚙️ **Backend API:** https://trustvault-api.duckdns.org  
💻 **GitHub Repository:** https://github.com/jeevansankar/TrustVault

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [System Architecture](#-system-architecture)
6. [How Document Sharing Works](#-how-document-sharing-works)
7. [Security Design](#-security-design)
8. [Local Installation](#-local-installation)
9. [Environment Configuration](#-environment-configuration)
10. [Running the Application](#-running-the-application)
11. [Demo Accounts](#-demo-accounts)
12. [Testing the Application](#-testing-the-application)
13. [Database and File Storage](#-database-and-file-storage)
14. [Deployment](#-deployment)
15. [API Documentation](#-api-documentation)
16. [Threat Analysis](#-threat-analysis)
17. [AI-Assisted Development](#-ai-assisted-development)
18. [Known Limitations](#-known-limitations)
19. [Future Improvements](#-future-improvements)
20. [Author](#-author)

---

## 🎯 Project Overview

TrustVault is a security-focused document management application developed using React, Java Spring Boot, and MySQL.

It provides document upload and download functionality, user-specific sharing, authentication, file integrity hashing, and security-related logging.

The main objective is to ensure that documents are accessible only to authorized users and that important security activities can be investigated.

## 🚨 Problem Statement

Traditional document-sharing systems can expose confidential information when permissions are too broad, access is not revoked correctly, or document activity cannot be traced.

TrustVault addresses these challenges through:

- 🔑 Authentication and account verification.
- 👤 User-specific document permissions.
- 📄 Document upload and download.
- 🔒 Backend-enforced access controls.
- 🧾 Security-related activity logging.
- 🛡️ SHA-256 file integrity verification.

The project prioritizes security alongside functionality.

## ✨ Key Features

### 🔑 Authentication
- User registration and email OTP verification.
- JWT-based authentication.
- Password recovery functionality.
- Spring Security integration.

### 📂 Document Management
- Upload documents.
- View and manage personal documents.
- Download authorized documents.
- Store document metadata.

### 🤝 Controlled Document Sharing
- Share a document with a particular user.
- Allow the intended recipient to view and download shared documents.
- Sharing is designed to provide view-only access rather than document editing.
- Backend authorization is responsible for protecting document operations.

### 🛡️ File Integrity
- SHA-256 integrity hash support.
- Hashes can be used to check whether a file has changed.

### 🧾 Security Logging
- Records security-related activities supported by the application.
- Provides a foundation for investigating document activity.

### ☁️ Cloud Deployment
- React frontend hosted on Render.
- Spring Boot backend hosted on AWS EC2.
- MySQL database hosted on Amazon RDS.
- DuckDNS domain and Caddy reverse proxy configured for HTTPS.

---

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Java 21, Spring Boot |
| Build tool | Maven Wrapper |
| Security | Spring Security, JWT |
| Database | MySQL |
| Database migrations | Flyway, when enabled in the project configuration |
| File integrity | SHA-256 |
| Email verification | Email OTP integration |
| Frontend hosting | Render |
| Backend hosting | AWS EC2 |
| Database hosting | Amazon RDS for MySQL |
| HTTPS and domain | Caddy, DuckDNS |
| Version control | Git, GitHub |

---

## 🏗️ System Architecture

```text
                 USER / BROWSER
                       |
                       v
              REACT + VITE FRONTEND
                    (Render)
                       |
                  HTTPS / API
                       |
                       v
              SPRING BOOT BACKEND
                    (AWS EC2)
                       |
          +------------+------------+
          |            |            |
          v            v            v
     SPRING        AMAZON RDS    PRIVATE FILE
     SECURITY      MySQL         STORAGE
     AND JWT       DATABASE      ON BACKEND
          |
          v
   DOCUMENT AUTHORIZATION
   AND SECURITY LOGGING
```

**Important:** MySQL stores database records and metadata. Uploaded document files are stored separately by the backend in its configured storage directory. Database backups do not automatically back up those files.

---

## 🔐 How Document Sharing Works

1. A registered user signs in.
2. The document owner uploads a document.
3. The owner shares the document with a particular user.
4. The intended recipient can view or download the shared document according to the granted permissions.
5. The recipient should not be able to edit the document through view-only sharing.
6. Access should be checked by the backend on each protected operation.
7. When sharing permission is revoked, the recipient should lose access to subsequent requests.

**Security principle:** Hiding a button in the frontend is not sufficient. The backend must enforce authorization for document viewing, downloading, modification, and deletion.

---

## 🛡️ Security Design

TrustVault incorporates several security controls:

- **Authentication:** JWT-based login and Spring Security.
- **Authorization:** Server-side checks for protected operations.
- **User-specific sharing:** Documents are shared with intended recipients.
- **Transport security:** HTTPS for communication with the deployed application.
- **Secret management:** Configuration through environment variables.
- **Integrity verification:** SHA-256 hashes for supported file-integrity checks.
- **Activity logging:** Security-related events recorded by the application.

Security tests and comprehensive audit coverage remain areas for further development. See [THREATS.md](THREATS.md) for the documented threat analysis.

---

## 💻 Local Installation

### Prerequisites

Install the following software:

- Java JDK 21
- Git
- Node.js LTS and npm
- MySQL Server

Verify the installations:

```bash
java -version
git --version
node -v
npm -v
mysql --version
```

### Step 1 — Clone the repository

```bash
git clone https://github.com/jeevansankar/TrustVault.git
cd TrustVault
```

### Step 2 — Create the database

Start MySQL and execute:

```sql
CREATE DATABASE trustvault;
```

Configure the database connection using the properties and environment variables expected by the backend.

Check the backend configuration in:

```text
backend/src/main/resources/application.properties
```

If Flyway is enabled, the configured migrations manage the database schema during startup.

### Step 3 — Configure environment variables

Set the required configuration for:

- MySQL connection URL, username, and password.
- Email-provider credentials.
- JWT signing secret.
- OTP security settings.
- Private document storage path.

Use the exact variable names expected by the application's configuration. Do not assume that a `.env` file is automatically loaded by Spring Boot.

**Never commit production credentials or secret keys to GitHub.**

### Step 4 — Build and run the backend

Open a terminal in the repository root.

**Windows PowerShell:**

```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
java -jar target\trustvault-0.0.1-SNAPSHOT.jar
```

**macOS / Linux:**

```bash
cd backend
chmod +x mvnw
./mvnw clean package -DskipTests
java -jar target/trustvault-0.0.1-SNAPSHOT.jar
```

Wait for Spring Boot to start successfully. Keep the backend terminal open.

### Step 5 — Install and run the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, commonly:

http://localhost:5173

Ensure the frontend API configuration points to the local backend when running locally.

### Step 6 — Verify the setup

Check that:

- MySQL is running and the backend connects successfully.
- Spring Boot starts without configuration or schema errors.
- The frontend can communicate with the backend.
- Login and registration work with valid credentials.
- Email OTP and password recovery work with valid email-provider configuration.
- Document upload, download, and authorized sharing work correctly.

---

## ⚙️ Environment Configuration

The backend requires configuration appropriate to the environment.

| Configuration | Purpose |
|---|---|
| Database settings | Connect Spring Boot to MySQL |
| Email settings | Send verification and password-reset emails |
| JWT secret | Sign and validate authentication tokens |
| OTP settings | Protect verification codes |
| Storage path | Specify where uploaded documents are stored |

Refer to the actual backend configuration for the required variable names and formats. Keep local development credentials separate from production credentials.

---

## 🧪 Demo Accounts

**Use real, tested accounts before sharing this repository with evaluators.** The placeholders below must be replaced with valid credentials created in the deployed application.

| Account | Username / Email | Password |
|---|---|---|
| Document owner | `REPLACE_WITH_OWNER_EMAIL` | `REPLACE_WITH_TESTED_PASSWORD` |
| Shared viewer | `REPLACE_WITH_VIEWER_EMAIL` | `REPLACE_WITH_TESTED_PASSWORD` |
| Administrator | `REPLACE_WITH_ADMIN_EMAIL_IF_IMPLEMENTED` | `REPLACE_WITH_TESTED_PASSWORD` |

Do not claim an administrator account is available unless the application actually supports the administrator role and its intended permissions.

Use dedicated test accounts and never publish personal account credentials or production secrets.

---

## ✅ Testing the Application

Recommended manual test cases:

| Test | Expected result |
|---|---|
| Sign in with valid credentials | Authentication succeeds |
| Sign in with an incorrect password | Authentication is rejected |
| Upload a document | Authorized upload succeeds |
| Download an owned document | Owner can download it |
| Share with a specific user | Intended recipient gains the granted access |
| Access a shared document | Authorized recipient can view or download |
| Attempt access as an unrelated user | Backend rejects unauthorized access |
| Revoke sharing permission | Subsequent protected requests are denied |
| Attempt editing through view-only sharing | Editing is not permitted |
| Verify file integrity | Supported hash check detects a changed file |

These are test objectives, not a claim that a complete automated test suite already exists. Automated security tests covering these cases are still an improvement area.

---

## 🗄️ Database and File Storage

TrustVault uses MySQL for persistent application data and database records.

The deployed database is hosted on Amazon RDS. Document files are managed separately by the backend in its configured private storage location.

**Backup considerations:**

- Amazon RDS backups protect the database within the configured backup and retention settings.
- RDS backups do not automatically include document files stored on the backend server.
- A separate file backup and restoration process is required to recover deleted or lost documents.
- Backup and recovery of uploaded document files is not yet fully implemented.

---

## ☁️ Deployment

The deployed architecture uses:

| Component | Deployment |
|---|---|
| Frontend | Render |
| Backend | AWS EC2 |
| Database | Amazon RDS for MySQL |
| API domain | DuckDNS |
| HTTPS reverse proxy | Caddy |

Live links:

- **Application:** https://trustvault-app-k8a4.onrender.com
- **Backend API domain:** https://trustvault-api.duckdns.org
- **Source code:** https://github.com/jeevansankar/TrustVault

The application requires correctly configured database connectivity, environment variables, email delivery, CORS, and frontend API settings.

---

## 📚 API Documentation

The backend exposes REST endpoints for authentication and document operations.

For each endpoint, API documentation should specify:

- HTTP method and route.
- Required authentication.
- Required role or document permission.
- Request parameters and body.
- Successful response and error responses.
- Authorization checks performed by the backend.

The login endpoint observed in the deployed application is:

```text
POST /api/v1/auth/login
```

Consult the backend controller classes and security configuration for the complete, verified endpoint list. A complete endpoint-by-endpoint API reference remains to be documented.

---

## 🧠 Threat Analysis

The project includes [THREATS.md](THREATS.md), which documents potential security risks and mitigations.

Important threat scenarios include:

- Unauthorized access to another user's document.
- Attempts to download a file by calling the API directly.
- Access to a document after permission revocation.
- Attempts to modify or delete a view-only shared document.
- Exposure of credentials or signing secrets.
- Tampering with or insufficient recording of audit events.
- Uploading unexpected or unsafe file types.
- Loss of uploaded files or incomplete recovery after deletion.

The application still needs comprehensive automated security tests and stronger verification of audit coverage and tamper resistance.

---

## 🤖 AI-Assisted Development

AI tools used during development:

- ChatGPT
- Claude

They assisted with coding, debugging, security configuration reviews, interface design, and cloud deployment troubleshooting.

The developer reviewed configurations, inspected logs, and checked generated suggestions against the application's behavior rather than treating AI output as automatically correct.

See [PROMPTS.md](PROMPTS.md) for the AI development record. Entries should reflect actual prompts, specific errors or limitations, the corrections made, and real commit links.

---

## ⚠️ Known Limitations

The core document workflows have been implemented, including uploading, downloading, and user-specific view-only sharing. The following areas still need completion or stronger verification:

1. **Administrator dashboard:** A dedicated view of users, login activity, document sharing, and security events.
2. **Complete audit trail:** Comprehensive tracking of document views, downloads, permission changes, deletions, and denied access attempts.
3. **Tamper resistance:** Stronger protection and verification for audit records.
4. **Automated security tests:** A complete test suite for cross-user access, unauthorized downloads, modifications, deletions, and permission revocation.
5. **Threat coverage:** Expand threat scenarios and link them to corresponding tests.
6. **API documentation:** Document every endpoint and its authorization requirements.
7. **Backup and recovery:** Implement and test recovery for document files, not just database records.
8. **Clean-clone setup:** Verify the complete installation instructions and required configuration on a fresh machine.
9. **Evaluation accounts and seed data:** Provide working test accounts and representative documents for each supported role.

These limitations are documented honestly rather than presented as completed features.

---

## 🚀 Future Improvements

- Build an administrator dashboard for monitoring document activity.
- Add comprehensive authorization tests and integration tests.
- Expand audit coverage and implement stronger tamper-evidence controls.
- Implement secure document-file backups and tested recovery procedures.
- Publish a complete API reference.
- Add reproducible seed data and documented evaluation accounts.
- Improve upload validation, document lifecycle management, and operational monitoring.

---

## 👨‍💻 Author

**Challagundla Jeevan Sankar**

Project: **TrustVault — Secure Document Management System**

GitHub: https://github.com/jeevansankar/TrustVault

---

*TrustVault is a security-focused project developed for the Snovasys Fresher Hiring Challenge 2026. The documented limitations distinguish implemented functionality from work that still needs completion or verification.*
