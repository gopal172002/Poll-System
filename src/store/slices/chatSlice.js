import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  messages: [],
  isTyping: false,
  unreadCount: 0,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
      state.unreadCount += 1
    },
    clearMessages: (state) => {
      state.messages = []
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload
    },
    markAsRead: (state) => {
      state.unreadCount = 0
    },
  },
})

export const { setMessages, addMessage, clearMessages, setTyping, markAsRead } = chatSlice.actions

export default chatSlice.reducer
