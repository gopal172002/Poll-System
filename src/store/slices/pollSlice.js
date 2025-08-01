import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentPoll: null,
  pollHistory: [],
  participants: [],
  isLoading: false,
  error: null,
}

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload
    },
    updatePollResults: (state, action) => {
      if (state.currentPoll) {
        state.currentPoll.responses = action.payload.responses
        state.currentPoll.totalResponses = action.payload.totalResponses
      }
    },
    endPoll: (state) => {
      if (state.currentPoll) {
        state.currentPoll.isActive = false
        state.pollHistory.unshift(state.currentPoll)
      }
    },
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload
    },
    setParticipants: (state, action) => {
      state.participants = action.payload
    },
    addParticipant: (state, action) => {
      state.participants.push(action.payload)
    },
    updateParticipant: (state, action) => {
      const index = state.participants.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.participants[index] = action.payload
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setCurrentPoll,
  updatePollResults,
  endPoll,
  setPollHistory,
  setParticipants,
  addParticipant,
  updateParticipant,
  setLoading,
  setError,
  clearError,
} = pollSlice.actions

export default pollSlice.reducer
