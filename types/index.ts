// export type Status = "backlog" | "in progress" | "done";
export type Status = string;

export type Task = {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: Status;
  columnId: string;
  priority: string;
  dueDate: string;
  columnName: string;
};

export type BoardSections = {
  [name: string]: Task[];
};

export interface Todo {
  _id: string;
  $id: string;
  $createdAt: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  status: string;
  columnName: string;
  columnId: string;
  __v?: number;
}

export interface BoardColumn {
  _id: string;
  $id: string;
  $createdAt: string;
  boardId: string;
  columnName: string;
  todos: Todo[];
  __v: number;
}
