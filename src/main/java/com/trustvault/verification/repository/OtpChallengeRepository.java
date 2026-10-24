package com.trustvault.verification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trustvault.verification.entity.OtpChallenge;
import com.trustvault.verification.entity.OtpChannel;
import com.trustvault.verification.entity.OtpPurpose;

public interface OtpChallengeRepository
        extends JpaRepository<OtpChallenge, Long> {

    List<OtpChallenge>
    findByUserIdAndChannelAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
            Long userId,
            OtpChannel channel,
            OtpPurpose purpose
    );
}
/*
This repository retrieves unconsumed challenges for a particular user and channel, newest first. 
The service will use it to find the current challenge during verification. */