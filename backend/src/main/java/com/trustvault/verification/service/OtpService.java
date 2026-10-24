
package com.trustvault.verification.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.trustvault.user.entity.AccountStatus;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;
import com.trustvault.verification.entity.OtpChallenge;
import com.trustvault.verification.entity.OtpChannel;
import com.trustvault.verification.entity.OtpPurpose;
import com.trustvault.verification.repository.OtpChallengeRepository;

@Service
public class OtpService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int OTP_VALIDITY_MINUTES = 5;

    private final SecureRandom secureRandom = new SecureRandom();

    private final OtpChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final EmailOtpSender emailOtpSender;
    private final String hmacSecret;

    public OtpService(
            OtpChallengeRepository challengeRepository,
            UserRepository userRepository,
            EmailOtpSender emailOtpSender,
            @Value("${trustvault.otp.hmac-secret}") String hmacSecret) {

        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.emailOtpSender = emailOtpSender;
        this.hmacSecret = hmacSecret;
    }

    /*
     * REGISTRATION OTP
     */

    @Transactional
    public void sendVerificationCode(Long userId, OtpChannel channel) {

        validateEmailChannel(channel);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (user.getAccountStatus() != AccountStatus.PENDING_VERIFICATION) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This account does not require verification");
        }

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is already verified");
        }

        invalidateActiveChallenges(
                userId, OtpPurpose.REGISTRATION);

        createAndSendOtp(
                user, OtpPurpose.REGISTRATION);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void verifyCode(
            Long userId,
            OtpChannel channel,
            String submittedOtp) {

        validateEmailChannel(channel);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is already verified");
        }

        OtpChallenge challenge = findActiveChallenge(
                userId, OtpPurpose.REGISTRATION);

        verifyChallenge(challenge, submittedOtp);

        // Only a registration OTP can activate an account.
        user.setEmailVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    /*
     * PASSWORD-RESET OTP
     */

    @Transactional
    public void sendPasswordResetCode(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unable to process password reset"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE
                || !user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to process password reset");
        }

        invalidateActiveChallenges(
                userId, OtpPurpose.PASSWORD_RESET);

        createAndSendOtp(
                user, OtpPurpose.PASSWORD_RESET);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void verifyPasswordResetCode(
            Long userId,
            String submittedOtp) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or expired reset OTP"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE
                || !user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid or expired reset OTP");
        }

        OtpChallenge challenge = findActiveChallenge(
                userId, OtpPurpose.PASSWORD_RESET);

        // This consumes only a PASSWORD_RESET challenge.
        // It never activates an account.
        verifyChallenge(challenge, submittedOtp);
    }

    /*
     * SHARED OTP OPERATIONS
     */

    private void validateEmailChannel(OtpChannel channel) {
        if (channel != OtpChannel.EMAIL) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only email verification is supported");
        }
    }

    private void invalidateActiveChallenges(
            Long userId,
            OtpPurpose purpose) {

        List<OtpChallenge> oldChallenges =
                challengeRepository
                    .findByUserIdAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
                            userId,
                            OtpChannel.EMAIL,
                            purpose);

        oldChallenges.forEach(
                challenge -> challenge.setConsumed(true));

        challengeRepository.saveAll(oldChallenges);
    }

    private void createAndSendOtp(
            User user,
            OtpPurpose purpose) {

        String otp = generateOtp();

        OtpChallenge challenge = new OtpChallenge();
        challenge.setUserId(user.getId());
        challenge.setChannel(OtpChannel.EMAIL);
        challenge.setPurpose(purpose);
        challenge.setCodeHash(hashOtp(otp));
        challenge.setExpiresAt(
                LocalDateTime.now().plusMinutes(
                        OTP_VALIDITY_MINUTES));
        challenge.setAttempts(0);
        challenge.setConsumed(false);

        challengeRepository.save(challenge);

        // Send only to the email address stored on the account.
        emailOtpSender.send(user.getEmail(), otp);
    }

    private OtpChallenge findActiveChallenge(
            Long userId,
            OtpPurpose purpose) {

        List<OtpChallenge> challenges =
                challengeRepository
                    .findByUserIdAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
                            userId,
                            OtpChannel.EMAIL,
                            purpose);

        if (challenges.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No active OTP. Request a new code.");
        }

        return challenges.get(0);
    }

    private void verifyChallenge(
            OtpChallenge challenge,
            String submittedOtp) {

        if (challenge.isConsumed()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid or expired OTP");
        }

        if (!challenge.getExpiresAt().isAfter(LocalDateTime.now())) {
            challenge.setConsumed(true);
            challengeRepository.save(challenge);

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OTP has expired");
        }

        if (challenge.getAttempts() >= MAX_ATTEMPTS) {
            challenge.setConsumed(true);
            challengeRepository.save(challenge);

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many attempts. Request a new OTP.");
        }

        if (submittedOtp == null
                || !constantTimeEquals(
                        challenge.getCodeHash(),
                        hashOtp(submittedOtp))) {

            challenge.setAttempts(
                    challenge.getAttempts() + 1);

            if (challenge.getAttempts() >= MAX_ATTEMPTS) {
                challenge.setConsumed(true);
            }

            challengeRepository.save(challenge);

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid OTP");
        }

        // Successful OTP verification is single-use.
        challenge.setConsumed(true);
        challengeRepository.save(challenge);
    }

    /*
     * OTP GENERATION AND PROTECTION
     */

    private String generateOtp() {
        int value = secureRandom.nextInt(1_000_000);
        return String.format("%06d", value);
    }

    private String hashOtp(String otp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec key = new SecretKeySpec(
                    hmacSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");

            mac.init(key);

            byte[] digest = mac.doFinal(
                    otp.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder()
                    .encodeToString(digest);

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                    "Unable to protect OTP", exception);
        }
    }

    private boolean constantTimeEquals(
            String expected,
            String actual) {

        return java.security.MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8));
    }
}

/*
Important details
- SecureRandom generates unpredictable six-digit codes.
- HMAC-SHA-256 means the database does not store the raw OTP. 
The same code can only be checked using the configured secret.
- Five-minute expiry limits how long a code remains valid.
- Five attempts limits guessing per challenge. We'll also need request throttling 
    and protection against repeated challenge creation before production.
- Single-use codes are marked consumed after successful verification.
- Account activation occurs only after both flags are true.

One implementation detail to remember: delivery currently occurs inside the database transaction. 
For production, we'll improve this with reliable delivery handling and rate limiting 
so a provider failure cannot leave confusing verification state. */