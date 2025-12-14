// BoardStore.ts
import { createSlice } from "@reduxjs/toolkit";

// ----------------------
// Types
// ----------------------
interface BoardState {
  board: Board;
  newTaskInput: string;
  newTaskType: TypedColumn;
  searchString: string;
}

// ----------------------
// Initial State
// ----------------------
const initialState: BoardState = {
  board: { columns: new Map() },
  newTaskInput: "",
  newTaskType: "todo",
  searchString: "",
};

// Slice
// ----------------------
export const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setNewTaskInput: (state, action: { payload: string }) => {
      state.newTaskInput = action.payload;
    },
    setNewTaskType: (state, action: { payload: TypedColumn }) => {
      state.newTaskType = action.payload;
    },
    setSearchString: (state, action: { payload: string }) => {
      state.searchString = action.payload;
    },
    setBoardState: (state, action: { payload: Board }) => {
      state.board = action.payload;
    },
  },
});

// Export actions
export const {
  setNewTaskInput,
  setNewTaskType,
  setSearchString,
  setBoardState,
} = boardSlice.actions;

// Export reducer
export default boardSlice.reducer;
