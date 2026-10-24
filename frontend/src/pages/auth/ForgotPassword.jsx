
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email.trim());

      // Carry the email to the OTP page without asking the user to retype it.
      navigate(
        `/verify-reset-otp?email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      setError(err.message || "Unable to request a password reset.");
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

        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Forgot password?</h1>
        <p className="auth-description">
          Enter the email associated with your account to request a password
          reset code.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="reset-email">Email address</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
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
            {loading ? "Sending request..." : "Send reset code"}
          </button>
        </form>

        <p className="form-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;
