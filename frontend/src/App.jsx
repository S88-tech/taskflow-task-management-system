import { useEffect, useState } from "react";

import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";


const API_URL =
  "https://taskflow-task-management-system-2.onrender.com";


function App() {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [authPage, setAuthPage] = useState("login");


  // =====================================================
  // DARK / LIGHT MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {

    const savedTheme =
      localStorage.getItem("taskflow-theme");

    if (savedTheme === "dark") {
      return true;
    }

    if (savedTheme === "light") {
      return false;
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  });


  useEffect(() => {

    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    localStorage.setItem(
      "taskflow-theme",
      darkMode ? "dark" : "light"
    );

  }, [darkMode]);


  const toggleTheme = () => {

    setDarkMode(
      (currentMode) => !currentMode
    );

  };


  // =====================================================
  // THEME TOGGLE BUTTON
  // =====================================================

  const ThemeToggle = () => {

    return (

      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >

        {darkMode ? "☀️" : "🌙"}

      </button>
    );
  };


  // =====================================================
  // CHECK AUTHENTICATION
  // =====================================================

  const checkAuthentication = async () => {

    try {

      const token =
        sessionStorage.getItem(
          "taskflow_token"
        );


      const headers = {};


      // ===============================================
      // SEND JWT TOKEN
      // ===============================================

      if (token) {

        headers.Authorization =
          `Bearer ${token}`;

      }


      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",

          headers,

          credentials: "include",
        }
      );


      if (!response.ok) {

        setUser(null);

        return;
      }


      const data =
        await response.json();


      setUser(data.user);


    } catch (error) {

      console.error(
        "Authentication check failed:",
        error
      );

      setUser(null);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // CHECK AUTH ON PAGE LOAD
  // =====================================================

  useEffect(() => {

    checkAuthentication();

  }, []);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (loggedInUser) => {

    setUser(loggedInUser);

  };


  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegistered = () => {

    setAuthPage("login");

  };


  // =====================================================
  // PROFILE UPDATED
  // =====================================================

  const handleUserUpdated = (updatedUser) => {

    setUser(updatedUser);

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {

    try {

      await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            Authorization:
              `Bearer ${
                sessionStorage.getItem(
                  "taskflow_token"
                ) || ""
              }`,
          },
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }


    // Remove JWT token

    sessionStorage.removeItem(
      "taskflow_token"
    );


    setUser(null);

    setAuthPage("login");

  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (

      <>

        <ThemeToggle />

        <div className="auth-loading">

          <div className="auth-loading-card">

            <div className="auth-logo">
              ✓
            </div>

            <h2>
              TaskFlow
            </h2>

            <p>
              Checking authentication...
            </p>

          </div>

        </div>

      </>

    );
  }


  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {


    // ---------------------------------------------------
    // REGISTER PAGE
    // ---------------------------------------------------

    if (authPage === "register") {

      return (

        <>

          <ThemeToggle />

          <Register

            onRegistered={
              handleRegistered
            }

            onSwitchToLogin={() =>
              setAuthPage("login")
            }

          />

        </>

      );
    }


    // ---------------------------------------------------
    // LOGIN PAGE
    // ---------------------------------------------------

    return (

      <>

        <ThemeToggle />

        <Login

          onLogin={handleLogin}

          onSwitchToRegister={() =>
            setAuthPage("register")
          }

        />

      </>

    );
  }


  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  if (user.role === "admin") {

    return (

      <>

        <ThemeToggle />

        <AdminDashboard

          user={user}

          onLogout={handleLogout}

          onUserUpdated={
            handleUserUpdated
          }

        />

      </>

    );
  }


  // =====================================================
  // NORMAL USER DASHBOARD
  // =====================================================

  return (

    <>

      <ThemeToggle />

      <UserDashboard

        user={user}

        onLogout={handleLogout}

        onUserUpdated={
          handleUserUpdated
        }

      />

    </>

  );
}


export default App;