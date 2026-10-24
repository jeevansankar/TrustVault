
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resendOtp, verifyOtp } from "../../api/authApi";

function VerifyOtp() {
  // Read the user ID passed from the registration page.
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const navigate = useNavigate();

  // Store the OTP and the current page status.
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  // Verify the six-digit OTP using the Spring Boot API.
  async function handleVerify(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!userId || !/^[1-9]\d*$/.test(userId)) {
      setError("Registration ID is missing or invalid. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      // The backend expects userId, channel, and otp.
      const response = await verifyOtp(Number(userId), otp);

      // A successful response means the backend verified the OTP.
      setVerified(true);
      setOtp("");
      setMessage(
        typeof response === "string"
          ? response
          : "Email verified successfully."
      );
    } catch (err) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Request a new OTP without hiding the verification form.
  async function handleResend() {
    setError("");
    setMessage("");

    if (!userId || !/^[1-9]\d*$/.test(userId)) {
      setError("Registration ID is missing or invalid. Please register again.");
      return;
    }

    setResending(true);

    try {
      const response = await resendOtp(Number(userId));

      // Display the backend message, but keep the form available.
      setMessage(
        typeof response === "string"
          ? response
          : "A new verification code has been requested."
      );
    } catch (err) {
      setError(err.message || "Could not resend the verification code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            T
          </div>
          <span>TrustVault</span>
        </div>

        <p className="eyebrow">ACCOUNT VERIFICATION</p>

        <h1>{verified ? "Email verified!" : "Verify your email"}</h1>

        <p className="auth-description">
          {verified
            ? "Your email verification is complete. You can continue to login."
            : "Enter the six-digit code sent to your registered email address."}
        </p>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {message && (
          <div className="success-panel" role="status">
            <p>{message}</p>
          </div>
        )}

        {verified ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            Continue to login
          </button>
        ) : (
          <>
            <form onSubmit={handleVerify}>
              <div className="form-field">
                <label htmlFor="otp">Email verification code</label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading || resending || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </form>

            <button
              type="button"
              className="secondary-button"
              onClick={handleResend}
              disabled={resending || loading}
            >
              {resending ? "Sending..." : "Resend verification code"}
            </button>
          </>
        )}

        <p className="form-footer">
          <Link to="/register">Back to registration</Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyOtp;
