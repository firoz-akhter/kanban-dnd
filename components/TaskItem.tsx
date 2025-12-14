import { Card, CardContent } from "@mui/material";
import { Task } from "../types";

type TaskItemProps = {
  task: Task;
};

const TaskItem = ({ task }: TaskItemProps) => {
  console.log("checking branch changes");
  return (
    <Card>
      <CardContent>{task.title}</CardContent>
    </Card>
  );
};

export default TaskItem;
