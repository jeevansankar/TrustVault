package com.trustvault.verification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LocalEmailOtpSender implements EmailOtpSender {

    private static final Logger log =
            LoggerFactory.getLogger(LocalEmailOtpSender.class);

    @Override
    public void send(String emailAddress, String otp) {
        // LOCAL DEVELOPMENT ONLY. Never log OTPs in production.
        log.warn("[LOCAL OTP TEST] Email destination: {} | OTP: {}",
                emailAddress, otp);
    }
}