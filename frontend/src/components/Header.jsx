function Header({ onNewTask, searchText, onSearch }) {
  return (
    <header className="header">

      <div className="header-text">
        <h1>Good morning, Sachin 👋</h1>
        <p>Manage your tasks and stay productive.</p>
      </div>

      <div className="header-actions">

        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchText}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>

        <button
          className="new-task-btn"
          onClick={onNewTask}
        >
          + New Task
        </button>

      </div>

    </header>
  );
}

export default Header;