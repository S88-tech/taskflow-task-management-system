function Sidebar({
  activePage,
  onPageChange,
  user,
}) {

  const isAdmin =
    user?.role === "admin";


  return (

    <aside className="sidebar">

      {/* =================================================
          LOGO
          ================================================= */}

      <div className="sidebar-logo">

        <div className="logo-icon">
          ✓
        </div>

        <div className="logo-text">

          <h2>
            TaskFlow
          </h2>

          <p>
            Task Management
          </p>

        </div>

      </div>


      {/* =================================================
          NAVIGATION
          ================================================= */}

      <nav className="sidebar-nav">

        {/* DASHBOARD */}

        <button
          type="button"
          className={`nav-item ${
            activePage === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            onPageChange("dashboard")
          }
        >

          <span className="nav-icon">
            ▦
          </span>

          <span>
            Dashboard
          </span>

        </button>


        {/* ALL TASKS */}

        <button
          type="button"
          className={`nav-item ${
            activePage === "all"
              ? "active"
              : ""
          }`}
          onClick={() =>
            onPageChange("all")
          }
        >

          <span className="nav-icon">
            ☷
          </span>

          <span>
            All Tasks
          </span>

        </button>


        {/* COMPLETED */}

        <button
          type="button"
          className={`nav-item ${
            activePage === "completed"
              ? "active"
              : ""
          }`}
          onClick={() =>
            onPageChange("completed")
          }
        >

          <span className="nav-icon">
            ✓
          </span>

          <span>
            Completed
          </span>

        </button>


        {/* =================================================
            USERS - ADMIN ONLY
            ================================================= */}

        {isAdmin && (

          <button
            type="button"
            className={`nav-item ${
              activePage === "users"
                ? "active"
                : ""
            }`}
            onClick={() =>
              onPageChange("users")
            }
          >

            <span className="nav-icon">
              ◉
            </span>

            <span>
              Users
            </span>

          </button>

        )}

      </nav>


      {/* =================================================
          BOTTOM
          ================================================= */}

      <div className="sidebar-bottom">

        {/* SETTINGS */}

        <button
          type="button"
          className={`nav-item ${
            activePage === "settings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            onPageChange("settings")
          }
        >

          <span className="nav-icon">
            ⚙
          </span>

          <span>
            Settings
          </span>

        </button>


        {/* =================================================
            PROFILE
            ================================================= */}

        <div className="sidebar-profile">

          <div className="profile-avatar">

            {user?.profile_image ? (

              <img
                src={`https://taskflow-task-management-system-2.onrender.com${user.profile_image}`}
                alt="Profile"
                className="sidebar-profile-image"
              />

            ) : (

              user?.name
                ?.charAt(0)
                ?.toUpperCase() || "S"

            )}

          </div>


          <div className="profile-info">

            <strong>
              {user?.name || "User"}
            </strong>

            <span>

              {isAdmin
                ? "Administrator"
                : "Developer"}

            </span>

          </div>

        </div>

      </div>

    </aside>

  );
}


export default Sidebar;