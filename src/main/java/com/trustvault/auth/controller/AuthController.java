
package com.trustvault.auth.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trustvault.auth.dto.AuthResponse;
import com.trustvault.auth.dto.LoginRequest;
import com.trustvault.auth.dto.RegisterRequest;
import com.trustvault.auth.dto.RegistrationResponse;
import com.trustvault.auth.dto.ResendOtpRequest;
import com.trustvault.auth.dto.VerifyOtpRequest;
import com.trustvault.auth.service.AuthService;
import com.trustvault.auth.service.RegistrationService;
import com.trustvault.user.entity.User;
import com.trustvault.verification.entity.OtpChannel;
import com.trustvault.verification.service.OtpService;

import jakarta.validation.Valid;
@CrossOrigin 
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final RegistrationService registrationService;
    private final OtpService otpService;
    private final AuthService authService;


    public AuthController(
            RegistrationService registrationService,
            OtpService otpService,AuthService authService) {
        this.registrationService = registrationService;
        this.otpService = otpService;
        this.authService=authService;
        
        
    }
    

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = registrationService.register(request);

        RegistrationResponse response = new RegistrationResponse(
                user.getId(),
                user.getUsername(),
                user.getAccountStatus().name(),
                "Registration received. Verify your email to activate your account."
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        otpService.verifyCode(
                request.userId(),
                request.channel(),
                request.otp()
        );

        return ResponseEntity.ok(
                "Email verified successfully. Your account is now active."
        );
    }
    
       

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        otpService.sendVerificationCode(
                request.userId(),
                OtpChannel.EMAIL
        );

        return ResponseEntity.ok(
                "A new email verification code has been sent."
        );

    }

     @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request) {

         return ResponseEntity.ok(authService.login(request));

}
         @GetMapping("/me")
        public Map<String, String> getCurrentUser(
            Authentication authentication) {

                return Map.of(
                "username", authentication.getName(),
                "message", "JWT authentication successful"
        );
    }
}
