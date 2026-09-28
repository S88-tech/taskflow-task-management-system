import { useEffect, useState } from "react";

const API_URL =
  "https://taskflow-task-management-system-2.onrender.com";

function Login({ onLogin, onSwitchToRegister }) {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [socialLoading, setSocialLoading] = useState("");

  const [error, setError] = useState("");


  // =========================================================
  // OAUTH ERROR
  // =========================================================

  useEffect(() => {

    const params = new URLSearchParams(
      window.location.search
    );

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


  // =========================================================
  // EMAIL / PASSWORD LOGIN
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setLoading(true);

    setError("");


    try {

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail || "Login failed"
        );
      }


      // =====================================================
      // SAVE JWT TOKEN
      // =====================================================

      if (data.access_token) {

        sessionStorage.setItem(
          "taskflow_token",
          data.access_token
        );
      }


      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      onLogin(data.user);


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
        "Unable to login. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };


  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleLogin = () => {

    setError("");

    setSocialLoading("google");

    window.location.href =
      `${API_URL}/auth/google/login`;
  };


  // =========================================================
  // GITHUB LOGIN
  // =========================================================

  const handleGitHubLogin = () => {

    setError("");

    setSocialLoading("github");

    window.location.href =
      `${API_URL}/auth/github/login`;
  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          ✓
        </div>


        <h1>
          Welcome back
        </h1>


        <p className="auth-subtitle">
          Login to continue to TaskFlow.
        </p>


        {error && (

          <div className="auth-error">
            {error}
          </div>

        )}


        {/* =================================================
            EMAIL LOGIN
        ================================================= */}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              Email
            </label>

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

            <label>
              Password
            </label>

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
            disabled={
              loading ||
              socialLoading !== ""
            }
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>


        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="auth-divider">

          <span>
            OR
          </span>

        </div>


        {/* =================================================
            GOOGLE
        ================================================= */}

        <button
          type="button"
          className="social-btn"
          onClick={handleGoogleLogin}
          disabled={
            loading ||
            socialLoading !== ""
          }
        >

          {socialLoading === "google"
            ? "Connecting to Google..."
            : "Continue with Google"}

        </button>


        {/* =================================================
            GITHUB
        ================================================= */}

        <button
          type="button"
          className="social-btn"
          onClick={handleGitHubLogin}
          disabled={
            loading ||
            socialLoading !== ""
          }
        >

          {socialLoading === "github"
            ? "Connecting to GitHub..."
            : "Continue with GitHub"}

        </button>


        {/* =================================================
            REGISTER
        ================================================= */}

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