import {
  useEffect,
  useState,
} from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import StatCard from "./StatCard";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Settings from "./Settings";


const API_URL =
  "https://taskflow-task-management-system-2.onrender.com";


/* =========================================================
   AUTH HEADERS
   ========================================================= */

const getAuthHeaders = () => {

  const token =
    sessionStorage.getItem(
      "taskflow_token"
    );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};


function AdminDashboard({
  user,
  onLogout,
  onUserUpdated,
}) {


  // =====================================================
  // STATE
  // =====================================================

  const [tasks, setTasks] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [searchText, setSearchText] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [activePage, setActivePage] =
    useState("dashboard");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


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

            credentials: "include",

            headers: {
              ...getAuthHeaders(),
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to fetch tasks"
        );

      }


      setTasks(
        data.tasks || []
      );


    } catch (error) {

      console.error(
        "Fetch tasks error:",
        error
      );


      setError(
        error.message ||
        "Unable to load tasks."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/users/`,
          {
            method: "GET",

            credentials: "include",

            headers: {
              ...getAuthHeaders(),
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to fetch users"
        );

      }


      setUsers(
        data.users || []
      );


    } catch (error) {

      console.error(
        "Fetch users error:",
        error
      );

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchTasks();
    fetchUsers();

  }, []);


  // =====================================================
  // NAVIGATION
  // =====================================================

  const handlePageChange = (
    page
  ) => {

    setActivePage(page);

    setSearchText("");


    if (
      page === "completed"
    ) {

      setFilter(
        "completed"
      );

    } else {

      setFilter("all");

    }

  };


  // =====================================================
  // NEW TASK
  // =====================================================

  const handleNewTask = () => {

    setEditingTask(null);

    setIsModalOpen(true);

  };


  // =====================================================
  // TASK CREATED
  // =====================================================

  const handleTaskCreated = (
    newTask
  ) => {

    /*
     * SINGLE USER:
     *
     * newTask = {
     *   id: "...",
     *   title: "...",
     *   ...
     * }
     *
     * ALL USERS:
     *
     * newTask = [
     *   task1,
     *   task2,
     *   task3,
     *   ...
     * ]
     */


    // =================================================
    // ALL USERS
    // =================================================

    if (Array.isArray(newTask)) {

      setTasks(
        (currentTasks) => [
          ...currentTasks,
          ...newTask,
        ]
      );

    }


    // =================================================
    // SINGLE USER
    // =================================================

    else {

      setTasks(
        (currentTasks) => [
          ...currentTasks,
          newTask,
        ]
      );

    }


    setIsModalOpen(false);

  };


  // =====================================================
  // EDIT TASK
  // =====================================================

  const handleEditTask = (
    task
  ) => {

    setEditingTask(task);

    setIsModalOpen(true);

  };


  // =====================================================
  // TASK UPDATED
  // =====================================================

  const handleTaskUpdated = (
    updatedTask
  ) => {

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (task) =>
            task.id ===
            updatedTask.id
              ? updatedTask
              : task
        )
    );


    setIsModalOpen(false);

    setEditingTask(null);

  };


  // =====================================================
  // DELETE TASK
  // =====================================================

  const handleDeleteTask = async (
    taskId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await fetch(
          `${API_URL}/tasks/${taskId}`,
          {
            method: "DELETE",

            credentials: "include",

            headers: {
              ...getAuthHeaders(),
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to delete task"
        );

      }


      setTasks(
        (currentTasks) =>
          currentTasks.filter(
            (task) =>
              task.id !== taskId
          )
      );


    } catch (error) {

      console.error(
        "Delete task error:",
        error
      );


      alert(
        error.message ||
        "Unable to delete task."
      );

    }

  };


  // =====================================================
  // TOGGLE TASK STATUS
  // ADMIN
  // PATCH /tasks/{id}/status
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

            credentials: "include",

            body: JSON.stringify({
              status: newStatus,
            }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to update task status"
        );

      }


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

      console.error(
        "Update task status error:",
        error
      );


      alert(
        error.message ||
        "Unable to update task status."
      );

    }

  };


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (
    value
  ) => {

    setSearchText(value);

  };


  // =====================================================
  // FILTER
  // =====================================================

  const handleFilter = (
    value
  ) => {

    setFilter(value);


    if (
      value === "completed"
    ) {

      setActivePage(
        "completed"
      );

    } else {

      setActivePage(
        "all"
      );

    }

  };


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleCloseModal = () => {

    setIsModalOpen(false);

    setEditingTask(null);

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
            ...getAuthHeaders(),
          },
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

  const totalTasks =
    tasks.length;


  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;


  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "pending"
    ).length;


  // =====================================================
  // USER STATISTICS
  // =====================================================

  const totalUsers =
    users.filter(
      (item) =>
        item.role === "user"
    ).length;


  // =====================================================
  // FILTER TASKS
  // =====================================================

  const filteredTasks =
    tasks.filter((task) => {

      const search =
        searchText
          .toLowerCase()
          .trim();


      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(search) ||

        task.description
          .toLowerCase()
          .includes(search);


      let matchesFilter =
        true;


      if (
        filter === "pending"
      ) {

        matchesFilter =
          task.status ===
          "pending";

      }


      if (
        filter === "completed"
      ) {

        matchesFilter =
          task.status ===
          "completed";

      }


      if (
        filter === "high"
      ) {

        matchesFilter =
          task.priority ===
          "high";

      }


      return (
        matchesSearch &&
        matchesFilter
      );

    });


  // =====================================================
  // PAGE TITLE
  // =====================================================

  const getPageTitle = () => {

    if (
      activePage ===
      "completed"
    ) {

      return "Completed Tasks";

    }


    if (
      activePage ===
      "all"
    ) {

      return "All Tasks";

    }


    return "My Tasks";

  };


  // =====================================================
  // SETTINGS PAGE
  // =====================================================

  if (
    activePage ===
    "settings"
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
  // USERS PAGE
  // =====================================================

  if (
    activePage ===
    "users"
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

          <header className="user-dashboard-header">

            <div>

              <h1>
                User Management
              </h1>

              <p>
                Manage TaskFlow users and accounts.
              </p>

            </div>

          </header>


          <section className="tasks-section">

            <div className="section-header">

              <div>

                <h2>
                  Users
                </h2>

                <p>
                  {totalUsers} registered user(s)
                </p>

              </div>

            </div>


            {users.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No users found
                </h3>

                <p>
                  Registered users will appear here.
                </p>

              </div>

            ) : (

              users.map(
                (item) => (

                  <div
                    className="admin-user-card"
                    key={item.id}
                  >

                    <div className="admin-user-avatar">

                      {item.profile_image ? (

                        <img
                          src={`${API_URL}${item.profile_image}`}
                          alt={
                            item.name
                          }
                          className="sidebar-profile-image"
                        />

                      ) : (

                        item.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "U"

                      )}

                    </div>


                    <div className="admin-user-info">

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.email}
                      </span>

                    </div>


                    <span className="role-badge">

                      {item.role}

                    </span>

                  </div>

                )
              )

            )}

          </section>

        </main>

      </div>

    );

  }


  // =====================================================
  // MAIN ADMIN DASHBOARD
  // =====================================================

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

        <Header
          onNewTask={
            handleNewTask
          }

          searchText={
            searchText
          }

          onSearch={
            handleSearch
          }
        />


        {/* =================================================
            ADMIN LABEL
            ================================================= */}

        <div className="admin-user-label">

          <strong>
            ADMIN
          </strong>

          <span>
            · {user?.name ||
              "Administrator"}
          </span>

        </div>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="stats">

          <StatCard
            title="Total Tasks"
            value={
              totalTasks
            }
            description="All managed tasks"
          />


          <StatCard
            title="Pending"
            value={
              pendingTasks
            }
            description="Tasks remaining"
          />


          <StatCard
            title="Completed"
            value={
              completedTasks
            }
            description="Completed tasks"
          />


          <StatCard
            title="Users"
            value={
              totalUsers
            }
            description="Registered users"
          />

        </section>


        {/* =================================================
            TASKS
            ================================================= */}

        <section className="tasks-section">

          <div className="section-header">

            <div>

              <h2>
                {getPageTitle()}
              </h2>

              <p>

                Showing{" "}
                {
                  filteredTasks.length
                }{" "}

                of{" "}

                {totalTasks}{" "}

                tasks

              </p>

            </div>


            <select
              value={
                filter
              }

              onChange={(event) =>
                handleFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Tasks
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="high">
                High Priority
              </option>

            </select>

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
                Fetching tasks from the backend.
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
              EMPTY
              ================================================= */}

          {!loading &&
            !error &&
            filteredTasks.length ===
              0 && (

              <div className="empty-state">

                <h3>
                  No tasks found
                </h3>

                <p>
                  Create a task or change your filter.
                </p>

              </div>

            )}


          {/* =================================================
              TASK LIST
              ================================================= */}

          {!loading &&
            !error &&
            filteredTasks.length >
              0 &&

            filteredTasks.map(
              (task) => (

                <TaskCard
                  key={
                    task.id
                  }

                  task={
                    task
                  }

                  onToggle={() =>
                    handleToggleTask(
                      task
                    )
                  }

                  onDelete={
                    handleDeleteTask
                  }

                  onEdit={
                    handleEditTask
                  }

                />

              )
            )}

        </section>

      </main>


      {/* =================================================
          TASK MODAL
          ================================================= */}

      {isModalOpen && (

        <TaskModal

          onClose={
            handleCloseModal
          }

          onTaskCreated={
            handleTaskCreated
          }

          onTaskUpdated={
            handleTaskUpdated
          }

          editingTask={
            editingTask
          }

          users={
            users
          }

        />

      )}

    </div>

  );

}


export default AdminDashboard;