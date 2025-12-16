import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Task } from "../types";
import toast from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";

type TaskItemProps = {
  task: Task;
  fetchData: () => void;
  setIsUpdateTaskOpen: boolean;
  setUpdateTask: () => void;
};

const TaskItem = ({
  task,
  fetchData,
  setIsUpdateTaskOpen,
  setUpdateTask,
}: TaskItemProps) => {
  const baseUrl = "http://localhost:4000/api";
  const handleDeleteTask = async (e: any, taskId: string, columnId: string) => {
    // we will add popup for final confirmation before delete
    e.stopPropagation();
    const toastId = toast.loading("Deleting task...");

    try {
      const response = await fetch(
        `${baseUrl}/deleteTask/${taskId}/${columnId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete task");
      }

      toast.success("Task deleted", { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error deleting task", { id: toastId });
    }
  };

  // console.log("task in taskItem", task);
  return (
    <>
      <Card sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            display: "flex",
            gap: 0.5,
            zIndex: 10,
          }}
        >
          <Tooltip title="Edit task">
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                console.log("Edit task", task);
                setUpdateTask(task);
                setIsUpdateTaskOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete task">
            <IconButton
              size="small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => handleDeleteTask(e, task._id, task.columnId)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent>
          <h3 className="text-2xl">{task.title}</h3>
          <p className="text-xs border rounded-md p-4 pl-2 mt-4 border-gray-200">
            {task.description}
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default TaskItem;
