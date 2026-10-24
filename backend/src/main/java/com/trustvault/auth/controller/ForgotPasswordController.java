package com.trustvault.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trustvault.auth.dto.ForgotPasswordRequest;
import com.trustvault.auth.dto.ResetPasswordRequest;
import com.trustvault.auth.dto.VerifyResetOtpRequest;
import com.trustvault.auth.service.ForgotPasswordService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(
            ForgotPasswordService forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        return ResponseEntity.ok(Map.of(
                "message",
                forgotPasswordService.requestReset(request)
        ));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<Map<String, String>> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        String resetToken =
                forgotPasswordService.verifyResetOtp(request);

        return ResponseEntity.ok(Map.of(
                "message", "OTP verified successfully.",
                "resetToken", resetToken
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        return ResponseEntity.ok(Map.of(
                "message",
                forgotPasswordService.resetPassword(request)
        ));
    }
}