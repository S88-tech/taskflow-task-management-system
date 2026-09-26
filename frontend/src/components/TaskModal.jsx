import { useState } from "react";

const API_URL = "https://taskflow-task-management-system-2.onrender.com";

function TaskModal({
  onClose,
  onTaskCreated,
  onTaskUpdated,
  editingTask,
  users = [],
}) {
  const isEditing = Boolean(editingTask);

  const [title, setTitle] = useState(
    editingTask?.title || ""
  );

  const [description, setDescription] =
    useState(
      editingTask?.description || ""
    );

  const [priority, setPriority] =
    useState(
      editingTask?.priority || "medium"
    );

  const [dueDate, setDueDate] =
    useState(
      editingTask?.dueDate || ""
    );

  const [assignedTo, setAssignedTo] =
    useState(
      editingTask?.assigned_to || ""
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const normalUsers = users.filter(
    (item) => item.role === "user"
  );


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(
        "Task title is required."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Task description is required."
      );
      return;
    }

    if (!dueDate) {
      setError(
        "Please select a due date."
      );
      return;
    }

    if (!assignedTo) {
      setError(
        "Please select a user."
      );
      return;
    }

    setLoading(true);

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      assigned_to: assignedTo,
    };

    if (isEditing) {
      taskData.status =
        editingTask?.status ||
        "pending";
    }

    try {
      let response;

      if (isEditing) {
        response = await fetch(
          `${API_URL}/tasks/${editingTask.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify(
              taskData
            ),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/tasks/`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify(
              taskData
            ),
          }
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save task."
        );
      }

      if (isEditing) {
        onTaskUpdated(
          data.task
        );
      } else {
        onTaskCreated(
          data.task
        );
      }

      onClose();

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to save task."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header">

          <div>
            <h2>
              {isEditing
                ? "Edit Task"
                : "Create New Task"}
            </h2>

            <p>
              {isEditing
                ? "Update task details and assignment."
                : "Create a task and assign it to a user."}
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>


        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Task Title
            </label>

            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              maxLength={100}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              placeholder="Describe the task"
              rows="4"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              maxLength={500}
              required
            />

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>
                Priority
              </label>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
              >

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
                required
              />

            </div>

          </div>


          <div className="form-group">

            <label>
              Assign To
            </label>

            <select
              value={assignedTo}
              onChange={(event) =>
                setAssignedTo(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select a user
              </option>

              {normalUsers.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} —{" "}
                    {item.email}
                  </option>
                )
              )}

            </select>

            {normalUsers.length ===
              0 && (
              <small className="settings-help">
                No normal users are available for assignment.
              </small>
            )}

          </div>


          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="new-task-btn"
              disabled={
                loading ||
                normalUsers.length === 0
              }
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Task"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default TaskModal;