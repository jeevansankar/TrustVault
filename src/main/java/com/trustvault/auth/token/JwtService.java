
package com.trustvault.auth.token;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${trustvault.jwt.secret}")
    private String jwtSecret;

    @Value("${trustvault.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username) {

        Date issuedAt = new Date();

        Date expiration = new Date(
                issuedAt.getTime() + jwtExpirationMs
        );

        return Jwts.builder()
                .subject(username)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {

        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {

        try {
            Claims claims = extractAllClaims(token);

            String tokenUsername = claims.getSubject();
            Date expiration = claims.getExpiration();

            return tokenUsername != null
                    && tokenUsername.equals(username)
                    && expiration != null
                    && expiration.after(new Date());

        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public long getExpirationMs() {
        return jwtExpirationMs;
    }
}
/*
Method	Purpose
getSigningKey()	        Converts your Base64 secret into a cryptographic signing key.
generateToken()	        Creates a signed token containing the username and timestamps.
extractUsername()	    Reads the username from a verified token.
isTokenValid()	        Checks the signature, username, and expiration.
extractAllClaims()	    Verifies and parses the signed token. */
