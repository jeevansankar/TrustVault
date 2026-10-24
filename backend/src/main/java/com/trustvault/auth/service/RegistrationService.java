
package com.trustvault.auth.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.trustvault.auth.dto.RegisterRequest;
import com.trustvault.user.entity.AccountStatus;
import com.trustvault.user.entity.User;
import com.trustvault.user.entity.UserRole;
import com.trustvault.user.repository.UserRepository;
import com.trustvault.verification.entity.OtpChannel;
import com.trustvault.verification.service.OtpService;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public RegistrationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    @Transactional
    public User register(RegisterRequest request) {

        String username = request.username()
                .trim()
                .toLowerCase(Locale.ROOT);

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        String phoneNumber = request.phoneNumber().trim();

        int passwordBytes = request.password()
                .getBytes(StandardCharsets.UTF_8).length;

        if (passwordBytes < 12 || passwordBytes > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be between 12 and 72 UTF-8 bytes");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username is already registered");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phone number is already registered");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);

        // Store only the encoded password.
        user.setPasswordHash(
                passwordEncoder.encode(request.password()));

        // Public registration cannot assign the ADMIN role.
        user.setRole(UserRole.OWNER);

        // Account activation requires email verification.
        user.setAccountStatus(AccountStatus.PENDING_VERIFICATION);
        user.setEmailVerified(false);

        try {
            // Persist the user before creating the OTP challenge.
            User savedUser = userRepository.saveAndFlush(user);

            // Email is the only supported verification channel.
            otpService.sendVerificationCode(
                    savedUser.getId(),
                    OtpChannel.EMAIL);

            return savedUser;

        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username, email, or phone number is already registered");
        }
    }
}
