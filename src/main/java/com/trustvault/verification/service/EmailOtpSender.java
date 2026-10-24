package com.trustvault.verification.service;

public interface EmailOtpSender {

    void send(String emailAddress, String otp);
}