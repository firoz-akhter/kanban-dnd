// export type Status = "backlog" | "in progress" | "done";
export type Status = string;

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
};

export type BoardSections = {
  [name: string]: Task[];
};
