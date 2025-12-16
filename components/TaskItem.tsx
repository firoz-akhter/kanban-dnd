import { Card, CardContent } from "@mui/material";
import { Task } from "../types";

type TaskItemProps = {
  task: Task;
};

const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <Card>
      <CardContent>
        <h3 className="text-2xl">{task.title}</h3>
        <p className="text-xs border rounded-md p-4 pl-2 mt-4 border-gray-200">
          {task.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
