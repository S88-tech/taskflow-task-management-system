function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
}) {
  const isCompleted =
    task.status === "completed";

  return (
    <div
      className={`task-card ${
        isCompleted ? "completed-task" : ""
      }`}
    >
      {/* CHECKBOX */}

      <div className="task-check">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(task.id)}
        />
      </div>

      {/* TASK CONTENT */}

      <div className="task-content">

        <h3>{task.title}</h3>

        <p>{task.description}</p>

        <div className="task-meta">

          {/* PRIORITY */}

          <span
            className={`priority ${task.priority}`}
          >
            {task.priority}
          </span>

          {/* DUE DATE */}

          <span>
            📅 {task.dueDate}
          </span>

          {/* STATUS */}

          <span className="task-status">
            {isCompleted
              ? "Completed"
              : "Pending"}
          </span>

        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div className="task-actions">

        {/* EDIT */}

        <button
          type="button"
          title="Edit task"
          onClick={() => onEdit(task)}
        >
          ✎
        </button>

        {/* DELETE */}

        <button
          type="button"
          title="Delete task"
          onClick={() => onDelete(task.id)}
        >
          🗑️
        </button>

      </div>

    </div>
  );
}

export default TaskCard;