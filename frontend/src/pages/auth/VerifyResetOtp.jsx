
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyResetOtp } from "../../api/authApi";

function VerifyResetOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Email is missing. Please request a new reset code.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyResetOtp(email, otp);

      if (!response?.resetToken) {
        throw new Error("The server did not return a reset token.");
      }

      navigate(
        `/reset-password?token=${encodeURIComponent(response.resetToken)}`
      );
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/login" className="brand">
          <span className="brand-icon">T</span>
          <span>TrustVault</span>
        </Link>

        <p className="eyebrow">SECURITY VERIFICATION</p>
        <h1>Verify reset code</h1>
        <p className="auth-description">
          Enter the six-digit code sent to your registered email.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="reset-otp">Six-digit OTP</label>
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify code"}
          </button>
        </form>

        <p className="form-footer">
          <Link to="/forgot-password">Request another reset code</Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyResetOtp;
