package com.trustvault.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.trustvault.auth.dto.ForgotPasswordRequest;
import com.trustvault.auth.dto.ResetPasswordRequest;
import com.trustvault.auth.dto.VerifyResetOtpRequest;
import com.trustvault.auth.entity.PasswordResetToken;
import com.trustvault.auth.repository.PasswordResetTokenRepository;
import com.trustvault.user.entity.AccountStatus;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;
import com.trustvault.verification.service.OtpService;

@Service
public class ForgotPasswordService {

    private static final int RESET_TOKEN_VALIDITY_MINUTES = 10;

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public ForgotPasswordService(
            UserRepository userRepository,
            OtpService otpService,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.otpService = otpService;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String requestReset(ForgotPasswordRequest request) {

        String email = normalizeEmail(request.email());

        userRepository.findByEmailIgnoreCase(email)
                .filter(user ->
                        user.getAccountStatus() == AccountStatus.ACTIVE
                        && user.isEmailVerified())
                .ifPresent(user ->
                        otpService.sendPasswordResetCode(user.getId()));

        // Do not disclose whether the account exists.
        return "If an eligible account exists, password-reset instructions will be sent.";
    }

    @Transactional
    public String verifyResetOtp(VerifyResetOtpRequest request) {

        String email = normalizeEmail(request.email());

        User user = userRepository.findByEmailIgnoreCase(email)
                .filter(account ->
                        account.getAccountStatus() == AccountStatus.ACTIVE
                        && account.isEmailVerified())
                .orElseThrow(() -> invalidResetRequest());

        otpService.verifyPasswordResetCode(user.getId(), request.otp());

        // Invalidate any previous reset authorizations for this user.
        tokenRepository.findAllByUserIdAndConsumedFalse(user.getId())
                .forEach(token -> token.setConsumed(true));

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setTokenHash(sha256(rawToken));
        resetToken.setExpiresAt(
                LocalDateTime.now().plusMinutes(
                        RESET_TOKEN_VALIDITY_MINUTES));
        resetToken.setConsumed(false);

        tokenRepository.save(resetToken);

        // Return this token once. Never store the raw value in the database.
        return rawToken;
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {

        int passwordBytes = request.newPassword()
                .getBytes(StandardCharsets.UTF_8).length;

        if (passwordBytes < 12 || passwordBytes > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be between 12 and 72 UTF-8 bytes");
        }

        String submittedTokenHash = sha256(request.resetToken());

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(submittedTokenHash)
                .orElseThrow(this::invalidResetRequest);

        if (resetToken.isConsumed()
                || !resetToken.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw invalidResetRequest();
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(this::invalidResetRequest);

        user.setPasswordHash(
                passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);

        // Consume every outstanding reset authorization for this account.
        tokenRepository.findAllByUserIdAndConsumedFalse(user.getId())
                .forEach(token -> token.setConsumed(true));

        return "Password reset successfully. Please log in again.";
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException invalidResetRequest() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid or expired password-reset authorization");
    }

    private String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable", exception);
        }
    }
}