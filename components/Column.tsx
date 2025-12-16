import React from "react";
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

type BoardSectionProps = {
  id: string;
  title: string;
  tasks: Task[];
};

const Column = ({ id, title, tasks }: BoardSectionProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  console.log("column props", id, title, tasks);
  console.log("id from column", id);

  return (
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
                <TaskItem task={task} />
              </SortableTaskItem>
            </Box>
          ))}
        </div>
      </SortableContext>
    </Box>
  );
};

export default Column;
