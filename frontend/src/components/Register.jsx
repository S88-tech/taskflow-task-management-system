import { useState } from "react";

const API_URL = "https://taskflow-task-management-system-2.onrender.com";

function Register({
  onRegistered,
  onSwitchToLogin,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed"
        );
      }

      setSuccess(
        "Account created successfully. You can now login."
      );

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onRegistered();
      }, 1000);

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to create account."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          ✓
        </div>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Start managing your tasks with TaskFlow.
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={6}
              required
            />

          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-switch">

          Already have an account?

          <button
            type="button"
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>

        </p>

      </div>

    </div>
  );
}

export default Register;