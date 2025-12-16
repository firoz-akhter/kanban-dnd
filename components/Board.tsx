"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
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

const Board = () => {
  // const oldTasks = INITIAL_TASKS;

  // const oldInitialBoardSections = OldInitializeBoard(INITIAL_TASKS);

  const [boardColumns, setBoardColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  // this is obj of columns with todos: [] in it boardSections = boardColumns
  const [boardSections, setBoardSections] = useState<BoardSectionsType>({});
  // console.log("boardSections,,", boardSections);

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

  useEffect(() => {
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

        const initialBoardSections = initializeBoard(fetchedTasks);
        setBoardSections(initialBoardSections);
      } catch (error) {
        console.error(error);
      }
    };

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

  const handleDragStart = ({ active }: DragStartEvent) => {
    console.log("handleDragStart", active);
    setActiveTaskId(active.id as string);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // Find the containers
    console.log("handleDragOver", active, over);
    const activeContainer = findBoardSectionContainer(
      boardSections,
      active.id as string
    );
    const overContainer = findBoardSectionContainer(
      boardSections,
      over?.id as string
    );

    // console.log("active and over container", activeContainer, overContainer);

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
    <Container>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={4}>
          {Object.keys(boardSections).map((boardSectionKey) => (
            <Grid item xs={4} key={boardSectionKey}>
              <Column
                id={boardSectionKey}
                title={boardSectionKey}
                tasks={boardSections[boardSectionKey]}
              />
            </Grid>
          ))}
          <DragOverlay dropAnimation={dropAnimation}>
            {task ? <TaskItem task={task} /> : null}
          </DragOverlay>
        </Grid>
      </DndContext>
    </Container>
  );
};

export default Board;
