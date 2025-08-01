import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  role: null, // 'teacher' | 'student' | null
  name: "",
  isAuthenticated: false,
  hasAnswered: false,
  selectedAnswer: null,
  isKickedOut: false,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserRole: (state, action) => {
      state.role = action.payload
    },
    setUserName: (state, action) => {
      state.name = action.payload
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload
    },
    setSelectedAnswer: (state, action) => {
      state.selectedAnswer = action.payload
    },
    setKickedOut: (state, action) => {
      state.isKickedOut = action.payload
    },
    resetUser: (state) => {
      return initialState
    },
  },
})

export const {
  setUserRole,
  setUserName,
  setAuthenticated,
  setHasAnswered,
  setSelectedAnswer,
  setKickedOut,
  resetUser,
} = userSlice.actions

export default userSlice.reducer
