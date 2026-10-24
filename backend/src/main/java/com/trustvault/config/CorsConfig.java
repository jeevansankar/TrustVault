
package com.trustvault.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        String allowedOrigin = System.getenv(
                "TRUSTVAULT_FRONTEND_URL");

        if (allowedOrigin == null || allowedOrigin.isBlank()) {
            throw new IllegalStateException(
                    "TRUSTVAULT_FRONTEND_URL environment variable is required");
        }

        configuration.setAllowedOrigins(
                Arrays.asList(allowedOrigin.trim()));

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET", "POST", "PUT", "PATCH",
                        "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(
                Arrays.asList(
                        "Authorization", "Content-Type",
                        "Accept", "Origin"));

        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
