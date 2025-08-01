import { configureStore } from "@reduxjs/toolkit"
import pollSlice from "./slices/pollSlice"
import userSlice from "./slices/userSlice"
import chatSlice from "./slices/chatSlice"
import { ReturnType } from "typescript"

export const store = configureStore({
  reducer: {
    poll: pollSlice,
    user: userSlice,
    chat: chatSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
