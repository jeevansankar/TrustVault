
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";

function Login() {
  const navigate = useNavigate();

  // Store what the user types and the current form status.
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      // Call the existing Spring Boot login endpoint.
      const response = await loginUser(identifier.trim(), password);

      // The backend returns an AuthResponse containing accessToken.
      if (!response?.accessToken) {
        throw new Error("The server did not return an access token.");
      }

      // Store the JWT for subsequent authenticated API requests.
      localStorage.setItem("trustvault_token", response.accessToken);

      // Open the protected dashboard after successful login.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link
          to="/register"
          className="brand"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <span className="brand-icon" aria-hidden="true">
            T
          </span>
          <span>TrustVault</span>
        </Link>

        <p className="eyebrow">SECURE DOCUMENT MANAGEMENT</p>

        <h1>Welcome back</h1>

        <p className="auth-description">
          Sign in to access your secure documents.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="identifier">Username or email</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Enter your username or email"
              autoComplete="username"
              maxLength={50}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              maxLength={72}
              required
              disabled={loading}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link to="/forgot-password">Forgot password?</Link>
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
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
