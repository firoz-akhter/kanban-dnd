import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import boardReducer from "./BoardStore";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    board: boardReducer,
  },
});

// types for TS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
