
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!resetToken) {
      setError("Your reset session is missing or invalid. Request a new code.");
      return;
    }

    if (password.length < 12 || password.length > 72) {
      setError("Your new password must be between 12 and 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetToken, password);

      // The user must sign in again with the new password.
      navigate("/login?reset=success", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
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

        <p className="eyebrow">SECURE YOUR ACCOUNT</p>
        <h1>Create new password</h1>
        <p className="auth-description">
          Choose a strong password with 12–72 characters.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
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
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </form>

        <p className="form-footer">
          <Link to="/login">Return to sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
