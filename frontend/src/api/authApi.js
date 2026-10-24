
import { apiRequest } from "./apiClient";

// Convert JavaScript data into JSON and send it to the backend.
function postJson(endpoint, data) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 1. Register a new TrustVault user.
export function registerUser(userData) {
  // userData must contain:
  // username, email, phoneNumber, password
  return postJson("/api/v1/auth/register", userData);
}

// 2. Verify the email OTP sent during registration.
export function verifyOtp(userId, otp) {
  return postJson("/api/v1/auth/verify-otp", {
    userId: userId,
    channel: "EMAIL",
    otp: otp,
  });
}

// 3. Request another email verification OTP.
export function resendOtp(userId) {
  return postJson("/api/v1/auth/resend-otp", {
    userId: userId,
  });
}

// 4. Log in using a username or another supported identifier.
export function loginUser(identifier, password) {
  return postJson("/api/v1/auth/login", {
    identifier: identifier,
    password: password,
  });
}

// 5. Get the currently authenticated user's details.
export function getCurrentUser() {
  return apiRequest("/api/v1/auth/me");
}

// 6. Request a password-reset OTP.
export function forgotPassword(email) {
  return postJson("/api/v1/auth/forgot-password", {
    email: email,
  });
}

// 7. Verify the OTP for password reset.
export function verifyResetOtp(email, otp) {
  return postJson("/api/v1/auth/verify-reset-otp", {
    email: email,
    otp: otp,
  });
}

// 8. Set a new password using the reset token.
export function resetPassword(resetToken, newPassword) {
  return postJson("/api/v1/auth/reset-password", {
    resetToken: resetToken,
    newPassword: newPassword,
  });
}
