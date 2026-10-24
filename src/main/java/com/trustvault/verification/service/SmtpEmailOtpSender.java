
package com.trustvault.verification.service;

import org.springframework.context.annotation.Primary;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@Primary
public class SmtpEmailOtpSender implements EmailOtpSender {

    private final JavaMailSender mailSender;

    public SmtpEmailOtpSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void send(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("TrustVault - Email Verification OTP");

        message.setText(
            "Hello,\n\n" +
            "Your TrustVault email verification code is: " + otp + "\n\n" +
            "This code expires in 5 minutes.\n" +
            "Do not share this code with anyone.\n\n" +
            "If you did not request this code, please ignore this email.\n\n" +
            "Regards,\nTrustVault Security Team"
        );

        mailSender.send(message);
    }
}
/*
Understand the important parts
- JavaMailSender connects to Gmail SMTP using the configuration you added.
- message.setTo(email) sends the message to the registered email address.
- message.setText(...) creates the email body containing your existing generated OTP.
- @Primary tells Spring to prefer this sender over your existing local email sender when both implement EmailOtpSender. */