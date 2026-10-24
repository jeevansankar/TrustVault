
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/authApi";

const initialFormData = {
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
};

function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigate to login or OTP verification without reloading the app.
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send the exact fields required by the backend.
      const response = await registerUser(formData);

      if (!response || response.userId == null) {
        throw new Error(
          "Registration succeeded, but the backend did not return a user ID."
        );
      }

      // Clear the password from the form after successful registration.
      setFormData(initialFormData);

      // Open the OTP verification page for this registered user.
      navigate(
        `/verify-otp?userId=${encodeURIComponent(response.userId)}`
      );
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/register" className="brand">
          <span className="brand-icon" aria-hidden="true">
            T
          </span>
          <span>TrustVault</span>
        </Link>

        <p className="eyebrow">SECURE DOCUMENT MANAGEMENT</p>

        <h1>Create your account</h1>

        <p className="auth-description">
          Create a secure account to manage and share your documents.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_.-]+"
              title="Use letters, numbers, underscores, dots or hyphens."
              autoComplete="username"
              required
              disabled={loading}
            />
            <small>
              3–50 characters: letters, numbers, _, . or -
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+919876543210"
              value={formData.phoneNumber}
              onChange={handleChange}
              pattern="\+[1-9][0-9]{7,14}"
              title="Enter an international number, such as +919876543210."
              autoComplete="tel"
              required
              disabled={loading}
            />
            <small>
              Include your country code, for example +91.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              required
              disabled={loading}
            />
            <small>Password must contain 12–72 characters.</small>
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
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="form-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
