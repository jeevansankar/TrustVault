
-- Remove the phone verification flag.
-- Phone numbers remain stored in the users table.
ALTER TABLE users
    DROP COLUMN phone_verified;

-- Restrict OTP challenges to email verification only.
ALTER TABLE otp_challenges
    DROP CHECK chk_otp_channel;

ALTER TABLE otp_challenges
    ADD CONSTRAINT chk_otp_channel
    CHECK (channel = 'EMAIL');
