"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store/store"
import { useSelector, useDispatch } from "react-redux"
import io from "socket.io-client"
import WelcomeScreen from "./components/WelcomeScreen"
import SetupScreen from "./components/SetupScreen"
import TeacherDashboard from "./components/TeacherDashboard"
import StudentDashboard from "./components/StudentDashboard"
import KickedOutScreen from "./components/KickedOutScreen"
import {
  setCurrentPoll,
  updatePollResults,
  endPoll,
  setPollHistory,
  setParticipants,
  addParticipant,
  updateParticipant,
} from "./store/slices/pollSlice"
import { setUserRole, setUserName, setAuthenticated, setHasAnswered, setKickedOut } from "./store/slices/userSlice"
import { setMessages, addMessage } from "./store/slices/chatSlice"
import "./App.css"

const socket = io("http://localhost:5000")

function AppContent() {
  const dispatch = useDispatch()
  const { role, isAuthenticated, isKickedOut } = useSelector((state) => state.user)
  const { currentPoll } = useSelector((state) => state.poll)

  useEffect(() => {
    // Socket event listeners
    socket.on("teacher-joined", (data) => {
      dispatch(setCurrentPoll(data.currentPoll))
      dispatch(setParticipants(data.participants))
      dispatch(setMessages(data.chatMessages))
      dispatch(setPollHistory(data.pollHistory))
    })

    socket.on("student-joined", (data) => {
      dispatch(setCurrentPoll(data.currentPoll))
      dispatch(setMessages(data.chatMessages))
      dispatch(setHasAnswered(data.hasAnswered))
    })

    socket.on("participant-joined", (participant) => {
      dispatch(addParticipant(participant))
    })

    socket.on("participant-updated", (updatedParticipant) => {
      dispatch(updateParticipant(updatedParticipant))
    })

    socket.on("poll-created", (poll) => {
      dispatch(setCurrentPoll(poll))
      dispatch(setHasAnswered(false))
    })

    socket.on("poll-updated", (poll) => {
      dispatch(
        updatePollResults({
          responses: poll.responses,
          totalResponses: poll.totalResponses,
        }),
      )
    })

    socket.on("poll-ended", (poll) => {
      dispatch(endPoll())
      dispatch(setCurrentPoll(poll))
    })

    socket.on("answer-submitted", (data) => {
      dispatch(setHasAnswered(true))
      dispatch(setCurrentPoll(data.currentPoll))
    })

    socket.on("new-message", (message) => {
      dispatch(addMessage(message))
    })

    socket.on("kicked-out", () => {
      dispatch(setKickedOut(true))
    })

    return () => {
      socket.off("teacher-joined")
      socket.off("student-joined")
      socket.off("participant-joined")
      socket.off("participant-updated")
      socket.off("poll-created")
      socket.off("poll-updated")
      socket.off("poll-ended")
      socket.off("answer-submitted")
      socket.off("new-message")
      socket.off("kicked-out")
    }
  }, [dispatch])

  const handleRoleSelection = (selectedRole) => {
    dispatch(setUserRole(selectedRole))
  }

  const handleStudentSetup = (name) => {
    dispatch(setUserName(name))
    dispatch(setAuthenticated(true))
    socket.emit("join-as-student", { name })
  }

  const handleTeacherSetup = () => {
    dispatch(setAuthenticated(true))
    socket.emit("join-as-teacher")
  }

  const handleCreatePoll = (pollData) => {
    socket.emit("create-poll", pollData)
  }

  const handleSubmitAnswer = (optionIndex) => {
    socket.emit("submit-answer", { optionIndex })
  }

  const handleSendMessage = (message) => {
    socket.emit("send-message", { message })
  }

  const handleKickStudent = (studentId) => {
    socket.emit("kick-student", studentId)
  }

  if (isKickedOut) {
    return <KickedOutScreen />
  }

  if (!role) {
    return <WelcomeScreen onRoleSelect={handleRoleSelection} />
  }

  if (!isAuthenticated) {
    return <SetupScreen userRole={role} onStudentSetup={handleStudentSetup} onTeacherSetup={handleTeacherSetup} />
  }

  if (role === "teacher") {
    return (
      <TeacherDashboard
        onCreatePoll={handleCreatePoll}
        onSendMessage={handleSendMessage}
        onKickStudent={handleKickStudent}
        socket={socket}
      />
    )
  }

  if (role === "student") {
    return <StudentDashboard onSubmitAnswer={handleSubmitAnswer} onSendMessage={handleSendMessage} socket={socket} />
  }

  return <div>Loading...</div>
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
