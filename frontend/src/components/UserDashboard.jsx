import {
  useEffect,
  useState,
} from "react";

import Sidebar from "./Sidebar";
import Settings from "./Settings";


const API_URL =
  "https://taskflow-task-management-system-2.onrender.com";


const getAuthHeaders = () => {
  const token = sessionStorage.getItem("taskflow_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};


function UserDashboard({
  user,
  onLogout,
  onUserUpdated,
}) {

  // =====================================================
  // STATE
  // =====================================================

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activePage, setActivePage] =
    useState("dashboard");


  // =====================================================
  // FETCH TASKS
  // =====================================================

  const fetchTasks = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await fetch(
          `${API_URL}/tasks/`,
          {
            method: "GET",
            credentials:
              "include",
            headers: {
              ...getAuthHeaders(),
            },
          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to fetch tasks"
        );

      }


      const data =
        await response.json();


      setTasks(
        data.tasks || []
      );


    } catch (error) {

      console.error(error);

      setError(
        "Unable to load your tasks."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD TASKS
  // =====================================================

  useEffect(() => {

    fetchTasks();

  }, []);


  // =====================================================
  // SIDEBAR NAVIGATION
  // =====================================================

  const handlePageChange = (
    page
  ) => {

    setActivePage(page);

  };


  // =====================================================
  // TOGGLE TASK STATUS
  // =====================================================

  const handleToggleTask = async (
    task
  ) => {

    const newStatus =
      task.status === "completed"
        ? "pending"
        : "completed";


    try {

      const response =
        await fetch(
          `${API_URL}/tasks/${task.id}/status`,
          {

            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
              ...getAuthHeaders(),
            },

            credentials:
              "include",

            body: JSON.stringify({
              status: newStatus,
            }),

          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to update task"
        );

      }


      const data =
        await response.json();


      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (currentTask) =>
              currentTask.id ===
              task.id
                ? data.task
                : currentTask
          )
      );


    } catch (error) {

      console.error(error);

      alert(
        "Unable to update task status."
      );

    }

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

          credentials:
            "include",
        }
      );


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


    } finally {

      sessionStorage.removeItem(
        "taskflow_token"
      );

      onLogout();

    }

  };


  // =====================================================
  // STATISTICS
  // =====================================================

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === "completed"
    ).length;


  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status === "pending"
    ).length;


  // =====================================================
  // FILTERED TASKS
  // =====================================================

  const displayedTasks =
    activePage === "completed"

      ? tasks.filter(
          (task) =>
            task.status === "completed"
        )

      : tasks;


  // =====================================================
  // SETTINGS PAGE
  // =====================================================

  if (
    activePage === "settings"
  ) {

    return (

      <div className="app">

        <Sidebar
          activePage={
            activePage
          }
          onPageChange={
            handlePageChange
          }
          user={user}
        />


        <main className="main">

          <Settings
            user={user}
            onUserUpdated={
              onUserUpdated
            }
            onLogout={
              handleLogout
            }
          />

        </main>

      </div>

    );

  }


  // =====================================================
  // MAIN USER DASHBOARD
  // =====================================================

  return (

    <div className="app">

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <Sidebar
        activePage={
          activePage
        }
        onPageChange={
          handlePageChange
        }
        user={user}
      />


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="main">


        {/* =================================================
            HEADER
            ================================================= */}

        <header className="user-dashboard-header">

          <div>

            <h1>
              Welcome,{" "}
              {user?.name || "User"} 👋
            </h1>

            <p>
              Here are the tasks assigned to you.
            </p>

          </div>


          <div className="user-header-profile">

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
                  ?.toUpperCase() || "U"

              )}

            </div>

          </div>

        </header>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="stats">

          <div className="stat-card">

            <div className="stat-content">

              <span className="stat-title">
                Total Tasks
              </span>

              <strong className="stat-value">
                {tasks.length}
              </strong>

              <span className="stat-description">
                Assigned to you
              </span>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-content">

              <span className="stat-title">
                Pending
              </span>

              <strong className="stat-value">
                {pendingTasks}
              </strong>

              <span className="stat-description">
                Tasks remaining
              </span>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-content">

              <span className="stat-title">
                Completed
              </span>

              <strong className="stat-value">
                {completedTasks}
              </strong>

              <span className="stat-description">
                Great progress!
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            TASK SECTION
            ================================================= */}

        <section className="tasks-section">


          <div className="section-header">

            <div>

              <h2>

                {activePage ===
                "completed"

                  ? "Completed Tasks"

                  : "My Tasks"}

              </h2>

              <p>

                {activePage ===
                "completed"

                  ? `${displayedTasks.length} completed task(s)`

                  : "Tasks assigned to you by the administrator."}

              </p>

            </div>


            {/* COMPLETED FILTER */}

            <button
              type="button"
              className={
                activePage ===
                "completed"
                  ? "filter-active-btn"
                  : "filter-btn"
              }
              onClick={() => {

                if (
                  activePage ===
                  "completed"
                ) {

                  setActivePage(
                    "dashboard"
                  );

                } else {

                  setActivePage(
                    "completed"
                  );

                }

              }}
            >

              {activePage ===
              "completed"

                ? "All Tasks"

                : "Completed"}

            </button>

          </div>


          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (

            <div className="empty-state">

              <h3>
                Loading tasks...
              </h3>

              <p>
                Fetching your assigned tasks.
              </p>

            </div>

          )}


          {/* =================================================
              ERROR
              ================================================= */}

          {!loading &&
            error && (

              <div className="empty-state">

                <h3>
                  Something went wrong
                </h3>

                <p>
                  {error}
                </p>

                <button
                  className="new-task-btn"
                  onClick={
                    fetchTasks
                  }
                >
                  Try Again
                </button>

              </div>

            )}


          {/* =================================================
              NO TASKS
              ================================================= */}

          {!loading &&
            !error &&
            displayedTasks.length ===
              0 && (

              <div className="empty-state">

                <h3>

                  {activePage ===
                  "completed"

                    ? "No completed tasks"

                    : "No tasks assigned"}

                </h3>

                <p>

                  {activePage ===
                  "completed"

                    ? "Complete your assigned tasks and they will appear here."

                    : "Your administrator has not assigned any tasks to you yet."}

                </p>

              </div>

            )}


          {/* =================================================
              TASK LIST
              ================================================= */}

          {!loading &&
            !error &&
            displayedTasks.length >
              0 &&

            displayedTasks.map(
              (task) => (

                <div
                  className={`user-task-card ${
                    task.status ===
                    "completed"
                      ? "completed-task"
                      : ""
                  }`}
                  key={task.id}
                >

                  {/* CHECKBOX */}

                  <div className="user-task-check">

                    <input
                      type="checkbox"
                      checked={
                        task.status ===
                        "completed"
                      }
                      onChange={() =>
                        handleToggleTask(
                          task
                        )
                      }
                    />

                  </div>


                  {/* CONTENT */}

                  <div className="user-task-content">

                    <h3>
                      {task.title}
                    </h3>

                    <p>
                      {task.description}
                    </p>


                    <div className="task-meta">

                      <span
                        className={`priority ${task.priority}`}
                      >
                        {task.priority}
                      </span>


                      <span>
                        📅 {task.dueDate}
                      </span>


                      <span className="task-status">

                        {task.status ===
                        "completed"

                          ? "Completed"

                          : "Pending"}

                      </span>

                    </div>

                  </div>

                </div>

              )
            )}

        </section>

      </main>

    </div>

  );
}


export default UserDashboard;