"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
// import { INITIAL_TASKS } from "../data/index";
import {
  BoardColumn,
  BoardSections as BoardSectionsType,
} from "../types/index";
import { getTaskById } from "../utils/tasks";
import {
  findBoardSectionContainer,
  initializeBoard,
  OldInitializeBoard,
} from "../utils/board";
// import BoardSection from "./BoardSection";
import Column from "./Column";
import TaskItem from "./TaskItem";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import Header from "./Header";
import { useRouter } from "next/navigation";

const Board = () => {
  // const oldTasks = INITIAL_TASKS;

  // const oldInitialBoardSections = OldInitializeBoard(INITIAL_TASKS);

  const router = useRouter();

  const [boardColumns, setBoardColumns] = useState<BoardColumn[]>([]);
  console.log("boardColumns,,", boardColumns);
  const [tasks, setTasks] = useState([]);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ columnName: "" });

  // this is obj of columns with todos: [] in it boardSections = boardColumns
  const [wholeBoardSections, setWholeBoardSections] =
    useState<BoardSectionsType>({});
  const [boardSections, setBoardSections] = useState<BoardSectionsType>({});
  // console.log("boardSections,,", boardSections);
  // console.log("wholeBoardSections", wholeBoardSections);

  // console.log("tasks...", tasks);
  // console.log(boardColumns);

  const baseUrl = "http://localhost:4000/api";
  const boardId = localStorage.getItem("boardId");
  const token = localStorage.getItem("token");
  // console.log("localStorage board id", typeof boardId);
  const getBoardColumns = async () => {
    try {
      const response = await fetch(`${baseUrl}/getBoardColumns/${boardId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // we will send token here
          // token: `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch board columns:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const data = await getBoardColumns();
      console.log("data,,,", data);
      setBoardColumns(data.data);
      // we will setTasks
      const fetchedTasks: any = [];
      data.data.forEach((column: any) => fetchedTasks.push(...column.todos));
      console.log("fetched tasks", fetchedTasks);
      setTasks(fetchedTasks);

      const initialBoardSections = initializeBoard(fetchedTasks, data.data);
      setBoardSections(initialBoardSections);
      setWholeBoardSections(initialBoardSections);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
    fetchData();
  }, []);

  const [activeTaskId, setActiveTaskId] = useState<null | string>(null);
  // console.log(activeTaskId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddColumn = async () => {
    if (!newColumn.columnName.trim()) {
      toast.error("Task title can't be empty");
      return;
    }

    // let boardId = "69317058536abc4e80038c55";

    try {
      const response = await fetch(`${baseUrl}/addColumn/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnName: newColumn.columnName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add new list");
      }

      console.log("List Added:", result.data);

      // add toaster
      toast.success("List created successfully🎉..");

      // ✅ Close dialog
      setIsAddColumnOpen(false);
      setNewColumn({ columnName: "" });

      // ✅ Reset form
      // setNewTask(initialNewTask);

      fetchData();

      // 🔥 Optional: refresh column / dispatch redux
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  const updateTask = async (
    activeContainer: any,
    overContainer: any,
    activeIndex: any,
    overIndex: any,
    taskId: any
  ) => {
    if (activeContainer == overContainer) return;

    const activeColumnId = boardColumns.find(
      (boardColumn) => boardColumn?.columnName === activeContainer
    )?._id;
    const overColumnId = boardColumns.find(
      (boardColumn) => boardColumn?.columnName === overContainer
    )?._id;
    console.log("activeColumnId", activeColumnId, activeContainer);
    console.log("overColumnId", overColumnId, overContainer);

    // here we will make the api call in order to update the task with taskId
    // we will send taskId, oldColumnId, newColumnId

    if (!activeColumnId || !overColumnId) {
      toast.error("Column not found");
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/moveTask/${taskId}/${activeColumnId}/${overColumnId}/${overIndex}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to move task");
      }

      console.log("Task moved successfully:", result.data);
      toast.success("Task moved successfully! 🎉");

      // Refresh the board data to reflect changes
      await fetchData();

      return result.data;
    } catch (error: any) {
      console.error("Error moving task:", error);
      toast.error(error.message || "Failed to move task");

      // Optionally revert the UI change by fetching data again
      await fetchData();
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    console.log("handleDragStart", active);
    setActiveTaskId(active.id as string);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // Find the containers
    // return;
    console.log("handleDragOver", active, over);
    const activeContainer = findBoardSectionContainer(
      boardSections,
      active.id as string
    );
    const overContainer = findBoardSectionContainer(
      boardSections,
      over?.id as string
    );

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    const activeItems = boardSections[activeContainer];
    const overItems = boardSections[overContainer];

    // Find the indexes for the items
    const activeIndex = activeItems.findIndex((item) => item._id === active.id);
    const overIndex = overItems.findIndex((item) => item._id === over?.id);

    // console.log("active and over Index", activeIndex, overIndex);
    updateTask(
      activeContainer,
      overContainer,
      activeIndex,
      overIndex + 1,
      active?.id
    );

    setBoardSections((boardSection) => {
      const activeItems = boardSection[activeContainer];
      const overItems = boardSection[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item._id === active.id
      );
      const overIndex = overItems.findIndex((item) => item._id === over?.id);

      return {
        ...boardSection,
        [activeContainer]: [
          ...boardSection[activeContainer].filter(
            (item) => item._id !== active.id
          ),
        ],
        [overContainer]: [
          ...boardSection[overContainer].slice(0, overIndex),
          boardSections[activeContainer][activeIndex],
          ...boardSection[overContainer].slice(
            overIndex,
            boardSection[overContainer].length
          ),
        ],
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    // console.log("inside handleDragEnd");
    const activeContainer = findBoardSectionContainer(
      boardSections,
      active.id as string
    );
    const overContainer = findBoardSectionContainer(
      boardSections,
      over?.id as string
    );

    // console.log("active and over,,", active, over);

    console.log("active and over container", activeContainer, overContainer);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = boardSections[activeContainer].findIndex(
      (task) => task._id === active.id
    );
    const overIndex = boardSections[overContainer].findIndex(
      (task) => task._id === over?.id
    );

    if (activeIndex !== overIndex) {
      // console.log("indexes not equal", activeIndex, overIndex);
      setBoardSections((boardSection) => ({
        ...boardSection,
        [overContainer]: arrayMove(
          boardSection[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    setActiveTaskId(null);
  };

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
  };

  const task = activeTaskId ? getTaskById(tasks, activeTaskId) : null;
  // const task = activeTaskId ? getTaskById(boardColumns, activeTaskId) : null;

  console.log("tasks", tasks);
  console.log("boardColumns", boardColumns);

  const filterBoardBySearchText = (searchText: string) => {
    console.log("inside filter", searchText);
    if (searchText === "") {
      console.log("empty..");
      setBoardSections(wholeBoardSections);
      return;
    }

    const filteredSections: any = {};
    const lowerSearchText = searchText.toLowerCase();

    Object.keys(wholeBoardSections).forEach((columnKey) => {
      const filteredTasks = wholeBoardSections[columnKey].filter((task) =>
        task.title.toLowerCase().includes(lowerSearchText)
      );

      filteredSections[columnKey] = filteredTasks;
    });
    setBoardSections(filteredSections);
  };

  return (
    <>
      <Header filterBoardBySearchText={filterBoardBySearchText} />
      <div className="absolute top-0 left-0 h-200 w-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-b-md -z-50 opacity-50 blur-3xl" />
      <Box sx={{ overflowX: "auto", px: 3 }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              minHeight: "calc(100vh - 175px)",
              pb: 2,
              marginLeft: 10,
            }}
          >
            {Object.keys(boardSections).map((boardSectionKey, idx) => (
              <Box
                key={boardSectionKey}
                sx={{
                  minWidth: 300,
                  maxWidth: 300,
                  flexShrink: 0,
                }}
              >
                <Column
                  id={boardSectionKey}
                  title={boardSectionKey}
                  tasks={boardSections[boardSectionKey]}
                  columnId={boardColumns[idx]._id}
                  // columnName={}
                  fetchData={fetchData}
                />
              </Box>
            ))}
            <Box
              sx={{
                minWidth: 300,
                maxWidth: 300,
                flexShrink: 0,
                marginRight: 20,
              }}
            >
              <Box sx={{ backgroundColor: "#eee", padding: 2, marginRight: 2 }}>
                <Button
                  onClick={() => setIsAddColumnOpen(true)}
                  variant="text"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 4,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Add New Task List
                </Button>
              </Box>
            </Box>
            {/* <DragOverlay dropAnimation={dropAnimation}>
              {task ? <TaskItem task={task} fetchData={fetchData} /> : null}
            </DragOverlay> */}
            <DragOverlay dropAnimation={dropAnimation}>
              {task ? (
                <div className="bg-white p-3 rounded-md shadow-lg opacity-90 cursor-grabbing">
                  <Typography variant="body1" fontWeight="bold">
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="mt-1"
                    >
                      {task.description}
                    </Typography>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </Box>
        </DndContext>
      </Box>

      {/* Add Task Popup */}
      <Dialog
        open={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Column</DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            required
            autoFocus
            fullWidth
            label="Task Title"
            value={newColumn.columnName}
            onChange={(e) =>
              setNewColumn((prev) => ({ ...prev, columnName: e.target.value }))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsAddColumnOpen(false)}>Cancel</Button>
          <Button onClick={handleAddColumn} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Board;
