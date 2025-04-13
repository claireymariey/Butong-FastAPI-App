import { useState, useEffect } from "react";
import axios from "axios";

// Update the API URL to match FastAPI backend paths
const API_URL = "https://butong-fastapi-app.onrender.com";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Fetch tasks from the backend
    axios
      .get(`${API_URL}/api/todos/fetch/`)  // Correct endpoint for fetching tasks
      .then((response) => {
        console.log(response.data);  // Log to inspect the structure of the response
        setTasks(response.data);  // Assuming your API returns the task list with 'title' and 'completed' fields
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  // Add a new task
  const addTask = () => {
    if (task.trim() === "") return;

    axios
      .post(`${API_URL}/api/todos/create/`, { title: task, completed: false })  // Correct endpoint for creating tasks
      .then((response) => {
        console.log("Task added:", response.data); // Log to ensure the task is added
        setTasks((prevTasks) => [...prevTasks, response.data]); // Add the new task to the state
        setTask(""); // Clear the input field
      })
      .catch((error) => {
        console.error("Error adding task:", error);
      });
  };

  // Delete a task
  const removeTask = (index) => {
    const taskToRemove = tasks[index];
    // Correct the delete URL
      axios
        .delete(`${API_URL}/api/todos/${taskToRemove.id}/delete/`)  // Correct delete URL
        .then(() => {
          setTasks(tasks.filter((_, i) => i !== index)); // Remove the task from the state
        })
        .catch((error) => {
          console.error("Error deleting task:", error);
        });
  };  

  // Start editing a task
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingText(tasks[index].title);  // Use 'title' here instead of 'text'
  };

  // Save edited task
  const saveEdit = () => {
    if (editingText.trim() === "") return;
    const updatedTask = { ...tasks[editingIndex], title: editingText };  // Update 'title'
    // Correct the update URL
    axios
      .put(`${API_URL}/api/todos/${updatedTask.id}/update/`, updatedTask)  // Correct update URL
      .then((response) => {
        console.log("Task updated:", response.data); // Log to ensure the task is updated
        const updatedTasks = [...tasks];
        updatedTasks[editingIndex] = response.data; // Update the task in the state
        setTasks(updatedTasks);
        setEditingIndex(null); // Reset the editing state
        setEditingText(""); // Clear the editing text
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  };

  // Toggle task completion
  const toggleComplete = (index) => {
    const updatedTask = { ...tasks[index], completed: !tasks[index].completed };
    axios
      .put(`${API_URL}${updatedTask.id}/update/`, updatedTask) // Correct endpoint for toggling task completion
      .then((response) => {
        const updatedTasks = tasks.map((t, i) => (i === index ? response.data : t)); // Update the task state
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error("Error toggling task completion:", error);
      });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  return (
    <div className="app-container">
      <h2>To-Do List</h2>

      {/* Task Input */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)} // Update task state
        />
        <button onClick={addTask}>➕ Add Task</button>
      </div>

      {/* Filter Buttons */}
      <div className="filter-container">
        <button onClick={() => setFilter("All")}>All</button>
        <button onClick={() => setFilter("Completed")}>Completed ✅</button>
        <button onClick={() => setFilter("Pending")}>Pending ⏳</button>
      </div>

      {/* Task List */}
      <ul className="task-list">
        {filteredTasks.map((t, index) => (
          <li key={index} className={`task-item ${t.completed ? "completed" : ""}`}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggleComplete(index)} // Toggle task completion
            />
            {editingIndex === index ? (
              <div className="edit-container">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)} // Update editing text state
                />
                <button className="save-btn" onClick={saveEdit}>💾 Save</button>
                <button className="cancel-btn" onClick={() => setEditingIndex(null)}>❌ Cancel</button>
              </div>
            ) : (
              <>
                <span className="task-text">{t.title}</span>  {/* Ensure you display the task 'title' */}
                <div className="buttons">
                  <button className="edit-btn" onClick={() => startEditing(index)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => removeTask(index)}>🗑️ Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
