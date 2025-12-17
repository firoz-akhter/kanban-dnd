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
import { INITIAL_TASKS } from "../data/index";
import { BoardSections as BoardSectionsType } from "../types/index";
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

const Board = () => {
  // const oldTasks = INITIAL_TASKS;

  // const oldInitialBoardSections = OldInitializeBoard(INITIAL_TASKS);

  const [boardColumns, setBoardColumns] = useState([]);
  console.log("boardColumns,,", boardColumns);
  const [tasks, setTasks] = useState([]);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ columnName: "" });

  // this is obj of columns with todos: [] in it boardSections = boardColumns
  const [boardSections, setBoardSections] = useState<BoardSectionsType>({});
  console.log("boardSections,,", boardSections);

  // console.log("tasks...", tasks);
  // console.log(boardColumns);

  const baseUrl = "http://localhost:4000/api";
  const getBoardColumns = async () => {
    try {
      const response = await fetch(`${baseUrl}/getBoardColumns`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
      const fetchedTasks = [];
      data.data.forEach((column) => fetchedTasks.push(...column.todos));
      console.log("fetched tasks", fetchedTasks);
      setTasks(fetchedTasks);

      const initialBoardSections = initializeBoard(fetchedTasks, data.data);
      setBoardSections(initialBoardSections);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
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

    let boardId = "69317058536abc4e80038c55";

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

      // ✅ Reset form
      // setNewTask(initialNewTask);

      fetchData();

      // 🔥 Optional: refresh column / dispatch redux
    } catch (error: any) {
      console.error(error);
      alert(error.message);
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

    console.log(
      "active and over container handleDragOver",
      activeContainer,
      overContainer
    );

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setBoardSections((boardSection) => {
      const activeItems = boardSection[activeContainer];
      const overItems = boardSection[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item._id === active.id
      );
      const overIndex = overItems.findIndex((item) => item._id !== over?.id);

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

  return (
    <>
      <Container>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* <Grid container spacing={4}> */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              minHeight: "calc(100vh - 200px)",
              pb: 2,
            }}
          >
            {/* <div className="flex gap-8 justify-center"> */}
            {Object.keys(boardSections).map((boardSectionKey, idx) => (
              // <Grid item xs={3} key={boardSectionKey}>
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
                {/* </Grid> */}
              </Box>
              // minor changes
            ))}
            {/* <Grid item xs={3} key=""> */}
            <Box
              sx={{
                minWidth: 300,
                maxWidth: 300,
                flexShrink: 0,
                marginRight: 20,
              }}
            >
              <Box sx={{ backgroundColor: "#eee", padding: 2, marginRight: 2 }}>
                {/* <Typography variant="h6" sx={{ mb: 2 }}> */}
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
                {/* </Typography> */}
              </Box>
              {/* </Grid> */}
            </Box>
            {/* </div> */}
            <DragOverlay dropAnimation={dropAnimation}>
              {task ? <TaskItem task={task} /> : null}
            </DragOverlay>
            {/* </Grid> */}
          </Box>
        </DndContext>
      </Container>

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
          {/* Task Title */}
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
