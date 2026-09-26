import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");

    if (oauthError) {
      setError(oauthError);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      onLogin(data.user);
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    setSocialLoading("google");

    window.location.href = `${API_URL}/auth/google/login`;
  };

  const handleGitHubLogin = () => {
    setError("");
    setSocialLoading("github");

    window.location.href = `${API_URL}/auth/github/login`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          ✓
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Login to continue to TaskFlow.
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || socialLoading !== ""}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="social-btn"
          onClick={handleGoogleLogin}
          disabled={loading || socialLoading !== ""}
        >
          {socialLoading === "google"
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button>

        <button
          type="button"
          className="social-btn"
          onClick={handleGitHubLogin}
          disabled={loading || socialLoading !== ""}
        >
          {socialLoading === "github"
            ? "Connecting to GitHub..."
            : "Continue with GitHub"}
        </button>

        <p className="auth-switch">
          Don't have an account?

          <button
            type="button"
            onClick={onSwitchToRegister}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;