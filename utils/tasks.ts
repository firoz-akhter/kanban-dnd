import { Task, Status } from "../types";

export const getTasksByStatus = (tasks: Task[], status: Status) => {
  return tasks.filter((task) => task?.columnName === status);
};

export const getTaskById = (tasks: Task[], id: string) => {
  return tasks.find((task) => task._id === id);
};
