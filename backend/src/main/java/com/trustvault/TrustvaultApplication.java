package com.trustvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//git add .
//git commit -m "Add meaningful feature description"
//git push

@SpringBootApplication
public class TrustvaultApplication {
	    //tasklist | findstr java   check what process are running 
		//taskkill /F /IM java.exe /T  kill all java process
		//taskkill /F /IM javaw.exe /T  background process kill
	public static void main(String[] args) {
		SpringApplication.run(TrustvaultApplication.class, args);
	}

}

/*
Task							Command
Clean previous build			mvn clean
Compile code					mvn compile
Run tests						mvn test
Package as JAR					mvn clean package
Start Spring Boot				mvn spring-boot:run
Clean, package and skip tests	mvn clean package -DskipTests
Run packaged JAR				java -jar target/trustvault-0.0.1-SNAPSHOT.jar

Run this single PowerShell command in your VS Code terminal to kill all processes listening on ports, including 8080, 8081, and others:

Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 } | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
*/
/*

$env:TRUSTVAULT_MAIL_USERNAME="jeevansankarchallagundla@gmail.com"
$env:TRUSTVAULT_MAIL_PASSWORD="ziqs yhgz cpvf awxo" 

*/
/*

$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:TRUSTVAULT_JWT_SECRET = [Convert]::ToBase64String($bytes)
Remove-Variable bytes
$rng.Dispose()

Write-Output "JWT secret generated successfully."
This generates a random 256-bit secret and stores it in the current terminal session. 
Keep using that same terminal when you run Spring Boot; closing it clears the environment variable.

 */

/*
src/main/java/com/trustvault/
│
├── TrustvaultApplication.java
│
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── StorageConfig.java
│
├── auth/
│   ├── controller/
│   │   └── AuthController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   └── RegistrationService.java
│   ├── dto/
│   │   ├── RegisterRequest.java
│   │   ├── RegistrationResponse.java
│   │   ├── VerifyOtpRequest.java
│   │   ├── ResendOtpRequest.java
│   │   ├── LoginRequest.java
│   │   └── AuthResponse.java
│   └── token/
│       ├── JwtService.java
│       └── JwtAuthenticationFilter.java
│
├── user/
│   ├── controller/
│   │   └── UserController.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── UserRole.java
│   │   └── AccountStatus.java
│   ├── repository/
│   │   └── UserRepository.java
│   └── service/
│       └── CustomUserDetailsService.java
│
├── verification/
│   ├── entity/
│   │   ├── OtpChallenge.java
│   │   └── OtpChannel.java
│   ├── repository/
│   │   └── OtpChallengeRepository.java
│   └── service/
│       ├── OtpService.java
│       ├── EmailOtpSender.java
│       ├── SmtpEmailOtpSender.java
│       └── LocalEmailOtpSender.java
│
├── document/
│   ├── controller/
│   │   └── DocumentController.java
│   ├── service/
│   │   ├── DocumentService.java
│   │   ├── FileStorageService.java
│   │   └── DocumentValidationService.java
│   ├── entity/
│   │   └── Document.java
│   ├── repository/
│   │   └── DocumentRepository.java
│   └── dto/
│       ├── DocumentUploadResponse.java
│       └── DocumentResponse.java
│
├── permission/
│   ├── controller/
│   │   └── DocumentPermissionController.java
│   ├── service/
│   │   └── DocumentPermissionService.java
│   ├── entity/
│   │   ├── DocumentPermission.java
│   │   └── PermissionLevel.java
│   ├── repository/
│   │   └── DocumentPermissionRepository.java
│   └── dto/
│       ├── ShareDocumentRequest.java
│       └── PermissionResponse.java
│
├── audit/
│   ├── controller/
│   │   └── AuditController.java
│   ├── service/
│   │   ├── AuditService.java
│   │   └── AuditIntegrityService.java
│   ├── entity/
│   │   └── AuditLog.java
│   └── repository/
│       └── AuditLogRepository.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── AccessDeniedException.java
│   └── FileValidationException.java
│
└── common/
    └── dto/
        └── ApiErrorResponse.java 
src/main/resources/
├── application.properties
└── db/migration/
    ├── V1__create_users.sql
    ├── V2__create_otp_challenges.sql
    ├── V3__remove_phone_verification.sql
    ├── V4__create_documents.sql
    ├── V5__create_document_permissions.sql
    └── V6__create_audit_logs.sql

src/test/java/com/trustvault/
├── auth/
├── document/
├── permission/
└── audit/

Dockerfile
compose.yaml
.gitignore
README.md
PROMPTS.md*/
/*
D. Audit logging and tamper evidence
The audit module records security-relevant activity.

Examples:
- USER_REGISTERED
- LOGIN_SUCCESS
- LOGIN_FAILED
- DOCUMENT_UPLOADED
- DOCUMENT_DOWNLOADED
- DOCUMENT_DELETED
- DOCUMENT_SHARED
- PERMISSION_REVOKED
- ACCESS_DENIED
An audit record should contain fields such as:
Field						Purpose
id							Unique audit record ID
actor_user_id				User who performed the action, if known
action						Event type
document_id					Related document, when applicable
timestamp					Event time
details	Safe, 				non-secret contextual information
previous_hash				Hash of the preceding record in the chain
record_hash					Hash of this record and its relevant fields

AuditIntegrityService will calculate and verify the hash chain. This makes unauthorized changes detectable when the chain is verified, but a hash chain alone does not guarantee immutability against an attacker who can rewrite the entire database and recompute every hash. Stronger protection requires an independently protected checkpoint or external append-only storage.

Never write passwords, OTP values, JWTs, or document contents into audit records. */