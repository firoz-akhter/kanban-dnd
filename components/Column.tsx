"use client";

import React, { use, useState } from "react";
import Box from "@mui/material/Box";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Typography from "@mui/material/Typography";
import { Task } from "../types/index";
import TaskItem from "./TaskItem";
import SortableTaskItem from "./SortableTaskItem";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import toast from "react-hot-toast";
import { stat } from "fs";

type BoardSectionProps = {
  id: string;
  title: string;
  tasks: Task[];
  columnId: string;
  fetchData: () => void;
  // isAddTaskOpen: boolean;
  // setIsAddTaskOpen: () => void;
};

const Column = ({
  id,
  title,
  tasks,
  columnId,
  fetchData,
}: // isAddTaskOpen,
// setIsAddTaskOpen,
BoardSectionProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  const initialNewTask = {
    title: "",
    status: title || "",
    description: "",
    priority: "",
    dueDate: "",
    ColumnName: title || "",
  };

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState(initialNewTask);
  console.log("newTask", newTask);
  console.log("columnId,,.", columnId);

  const [isUpdateTaskOpen, setIsUpdateTaskOpen] = useState(false);
  const [updateTask, setUpdateTask] = useState({
    title: "",
    status: "",
    description: "",
    priority: "",
    dueDate: "",
    columnName: "",
  });

  // console.log("updateTask", updateTask);

  console.log("column props", id, title, tasks);
  console.log("id from column", id);

  const baseUrl = "http://localhost:4000/api";

  const handleAddTask = async () => {
    // console.log("newTask", newTask);
    // console.log(columnId);
    // return;
    if (!newTask.title.trim()) {
      toast.error("Task title can't be empty");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/createTask/${columnId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title || "",
          description: newTask.description || "",
          priority: newTask.priority || "",
          dueDate: newTask.dueDate || "",
          status: newTask.status || "",
          columnName: newTask.ColumnName || "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create task");
      }

      console.log("Task created:", result.data);

      // add toaster
      toast.success("Task created successfully🎉..");

      // ✅ Close dialog
      setIsAddTaskOpen(false);

      // ✅ Reset form
      setNewTask(initialNewTask);

      fetchData();

      // 🔥 Optional: refresh column / dispatch redux
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleUpdateTask = async () => {
    if (!updateTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const toastId = toast.loading("Updating task...");

    try {
      const payload = {
        title: updateTask.title,
        description: updateTask.description,
        priority: updateTask.priority,
        dueDate: updateTask.dueDate,
        status: updateTask.status,
        // newColumnName: task.columnName, // ✅ IMPORTANT
      };

      const response = await fetch(
        `${baseUrl}/updateTask/${updateTask._id}/${updateTask.columnId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update task");
      }

      toast.success("Task updated successfully", { id: toastId });

      setIsUpdateTaskOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error updating task", { id: toastId });
    }
  };

  return (
    <>
      <Box sx={{ backgroundColor: "#eee", padding: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <SortableContext
          id={id}
          items={tasks}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef}>
            {tasks.map((task) => (
              <Box key={task._id} sx={{ mb: 2 }}>
                <SortableTaskItem id={task._id}>
                  <TaskItem
                    task={task}
                    fetchData={fetchData}
                    setIsUpdateTaskOpen={setIsUpdateTaskOpen}
                    setUpdateTask={setUpdateTask}
                  />
                </SortableTaskItem>
              </Box>
            ))}
          </div>
        </SortableContext>

        {/* add task section */}
        <Button
          onClick={() => setIsAddTaskOpen(true)}
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{
            mt: 4,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Add Task Popup */}
      <Dialog
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Task</DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Task Title */}
          <TextField
            required
            autoFocus
            fullWidth
            label="Task Title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          {/* Description */}
          <TextField
            required
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          {/* Priority */}
          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          {/* Due Date */}
          <TextField
            required
            fullWidth
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Task Popup */}
      <Dialog
        open={isUpdateTaskOpen}
        onClose={() => setIsUpdateTaskOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Task</DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Task Title */}
          <TextField
            required
            autoFocus
            fullWidth
            label="Task Title"
            value={updateTask.title}
            onChange={(e) =>
              setUpdateTask((prev) => ({ ...prev, title: e.target.value }))
            }
          />

          {/* Description */}
          <TextField
            required
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={updateTask.description}
            onChange={(e) =>
              setUpdateTask((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />

          {/* Priority */}
          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select
              value={updateTask.priority}
              label="Priority"
              onChange={(e) =>
                setUpdateTask((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          {/* Due Date */}
          <TextField
            required
            fullWidth
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={updateTask.dueDate}
            onChange={(e) =>
              setUpdateTask((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsUpdateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Column;
