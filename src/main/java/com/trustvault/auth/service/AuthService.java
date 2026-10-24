
package com.trustvault.auth.service;

import com.trustvault.auth.dto.AuthResponse;
import com.trustvault.auth.dto.LoginRequest;
import com.trustvault.auth.token.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.identifier().trim(),
                                request.password()));

        String token = jwtService.generateToken(authentication.getName());

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationMs() / 1000);
    }
}
