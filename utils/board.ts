import { BoardColumn, BoardSections, Status, Task } from "../types";
import { BOARD_SECTIONS } from "../constants";
import { getTasksByStatus } from "./tasks";

export const OldInitializeBoard = (tasks: Task[]) => {
  const boardSections: BoardSections = {};

  Object.keys(BOARD_SECTIONS).forEach((boardSectionKey) => {
    boardSections[boardSectionKey] = getTasksByStatus(
      tasks,
      boardSectionKey as Status
    );
  });

  return boardSections;
};

export const initializeBoard = (tasks: Task[], columns: BoardColumn[]) => {
  const boardSections: { [key: string]: Task[] } = {};

  // tasks.forEach((task) => (boardSections[task?.columnName] = []));
  columns.forEach((column) => (boardSections[column?.columnName] = []));
  // console.log("dummy boardSections", boardSections);

  Object.keys(boardSections).forEach((boardSectionKey) => {
    boardSections[boardSectionKey] = getTasksByStatus(
      tasks,
      boardSectionKey as Status
    );
  });

  return boardSections;
};

export const findBoardSectionContainer = (
  boardSections: BoardSections,
  id: string
) => {
  // console.log("id and boardSections", id, boardSections);
  if (id in boardSections) {
    return id;
  }

  const container = Object.keys(boardSections).find((key) =>
    boardSections[key].find((item) => item._id === id)
  );
  return container;
};
