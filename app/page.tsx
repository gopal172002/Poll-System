"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, MessageSquare, Send, X, History, RotateCcw } from "lucide-react"
import io from "socket.io-client"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswers: boolean[]
  timer: number
  isActive: boolean
  responses: { [key: string]: number }
  totalResponses: number
  createdAt: string
}

interface Participant {
  id: string
  name: string
  isActive: boolean
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: string
}

type UserRole = "teacher" | "student" | null
type AppState =
  | "welcome"
  | "setup"
  | "teacher-dashboard"
  | "create-question"
  | "live-poll"
  | "waiting"
  | "student-answer"
  | "results"
  | "kicked-out"

// Initialize socket connection
const socket = io("http://localhost:5000")

export default function IntervuePollSystem() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [appState, setAppState] = useState<AppState>("welcome")
  const [studentName, setStudentName] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [pollHistory, setPollHistory] = useState<Question[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState("live")
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", ""],
    correctAnswers: [false, false],
    timer: 60,
  })

  // Socket event listeners
  useEffect(() => {
    socket.on("teacher-joined", (data) => {
      console.log("Teacher joined data:", data)
      setCurrentQuestion(data.currentPoll)
      setParticipants(data.participants || [])
      setChatMessages(data.chatMessages || [])
      setPollHistory(data.pollHistory || [])

      // Set appropriate state for teacher
      if (data.currentPoll && data.currentPoll.isActive) {
        setAppState("live-poll")
      } else {
        setAppState("teacher-dashboard")
      }
    })

    socket.on("student-joined", (data) => {
      console.log("Student joined data:", data)
      setCurrentQuestion(data.currentPoll)
      setChatMessages(data.chatMessages || [])
      setHasAnswered(data.hasAnswered || false)

      // Set appropriate state for student
      if (data.currentPoll && data.currentPoll.isActive && !data.hasAnswered) {
        setAppState("student-answer")
      } else if (data.currentPoll && !data.currentPoll.isActive) {
        setAppState("results")
      } else {
        setAppState("waiting")
      }
    })

    socket.on("participant-joined", (participant) => {
      console.log("New participant joined:", participant)
      setParticipants((prev) => {
        const exists = prev.some((p) => p.id === participant.id)
        if (exists) return prev
        return [...prev, participant]
      })
    })

    socket.on("participant-updated", (updatedParticipant) => {
      setParticipants((prev) => prev.map((p) => (p.id === updatedParticipant.id ? updatedParticipant : p)))
    })

    socket.on("poll-created", (poll) => {
      console.log("Poll created:", poll)
      setCurrentQuestion(poll)
      setHasAnswered(false)
      setSelectedAnswer(null)
      setTimeLeft(poll.timer)

      if (userRole === "student") {
        setAppState("student-answer")
      } else {
        setAppState("live-poll")
      }
    })

    socket.on("poll-updated", (poll) => {
      setCurrentQuestion(poll)
    })

    socket.on("poll-ended", (poll) => {
      console.log("Poll ended:", poll)
      setCurrentQuestion(poll)
      setPollHistory((prev) => {
        const exists = prev.some((p) => p.id === poll.id)
        if (exists) return prev
        return [poll, ...prev]
      })

      if (userRole === "teacher") {
        setAppState("teacher-dashboard")
        setActiveTab("results")
      } else {
        setAppState("results")
      }
    })

    socket.on("answer-submitted", (data) => {
      setHasAnswered(true)
      setCurrentQuestion(data.currentPoll)
      setAppState("waiting")
    })

    socket.on("new-message", (message) => {
      console.log("New message received:", message)
      setChatMessages((prev) => [...prev, message])
    })

    socket.on("kicked-out", () => {
      setAppState("kicked-out")
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
  }, [userRole])

  // Timer effect - only for students
  useEffect(() => {
    if (userRole === "student" && timeLeft > 0 && currentQuestion?.isActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (userRole === "student" && timeLeft === 0 && currentQuestion?.isActive) {
      setAppState("results")
    }
  }, [timeLeft, currentQuestion, userRole])

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role)
    setAppState("setup")
  }

  const handleStudentSetup = () => {
    if (studentName.trim()) {
      console.log("Student joining with name:", studentName.trim())
      socket.emit("join-as-student", { name: studentName.trim() })
      setAppState("waiting")
    }
  }

  const handleTeacherSetup = () => {
    socket.emit("join-as-teacher")
    setAppState("teacher-dashboard")
  }

  const addOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
      correctAnswers: [...prev.correctAnswers, false],
    }))
  }

  const updateOption = (index: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  const updateCorrectAnswer = (index: number, isCorrect: boolean) => {
    setNewQuestion((prev) => ({
      ...prev,
      correctAnswers: prev.correctAnswers.map((correct, i) => (i === index ? isCorrect : correct)),
    }))
  }

  const startQuestion = () => {
    if (newQuestion.question.trim() && newQuestion.options.every((opt) => opt.trim())) {
      const pollData = {
        id: Date.now().toString(),
        question: newQuestion.question.trim(),
        options: newQuestion.options.filter((opt) => opt.trim()),
        correctAnswers: newQuestion.correctAnswers,
        timer: newQuestion.timer,
      }

      socket.emit("create-poll", pollData)
      setNewQuestion({
        question: "",
        options: ["", ""],
        correctAnswers: [false, false],
        timer: 60,
      })
      setAppState("live-poll")
    }
  }

  const submitAnswer = () => {
    if (selectedAnswer !== null && currentQuestion) {
      socket.emit("submit-answer", { optionIndex: selectedAnswer })
    }
  }

  const kickOutParticipant = (participantId: string) => {
    socket.emit("kick-student", participantId)
  }

  const createNewQuestion = () => {
    setAppState("create-question")
    setCurrentQuestion(null)
    setHasAnswered(false)
    setSelectedAnswer(null)
    setActiveTab("live")
  }

  const sendMessage = () => {
    if (chatInput.trim()) {
      console.log("Sending message:", chatInput.trim(), "as", userRole === "teacher" ? "Teacher" : studentName)
      socket.emit("send-message", { message: chatInput.trim() })
      setChatInput("")
    }
  }

  const getPercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Chat Component - Fixed for both teacher and student
  const ChatPanel = () => (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white shadow-2xl border border-gray-200 rounded-xl flex flex-col z-50 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl flex-shrink-0">
        <h3 className="font-semibold text-gray-800">Chat & Participants</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="h-8 w-8 p-0 hover:bg-white/50">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-3 bg-gray-100 flex-shrink-0">
          <TabsTrigger value="chat" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
          >
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col p-4 pt-3 m-0 min-h-0">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0 max-h-full pr-2">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-sm py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex-shrink-0 w-full">
                  <div className="font-semibold text-sm text-purple-600 mb-1">{msg.userName}</div>
                  <div className="text-sm text-gray-800 break-words leading-relaxed">{msg.message}</div>
                  <div className="text-xs text-gray-500 mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 border-t pt-3 bg-white flex-shrink-0">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <Button
              onClick={sendMessage}
              disabled={!chatInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="participants" className="flex-1 p-4 pt-3 m-0 overflow-y-auto min-h-0">
          <div className="space-y-3 h-full">
            <div className="flex justify-between items-center text-sm font-medium text-gray-600 border-b pb-2 flex-shrink-0">
              <span>Name</span>
              {userRole === "teacher" && <span>Action</span>}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Show teacher first if user is teacher */}
              {userRole === "teacher" && (
                <div className="mb-2">
                  <div className="flex justify-between items-center py-3 px-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        T
                      </div>
                      <span className="font-medium text-gray-800">Teacher (You)</span>
                    </div>
                  </div>
                </div>
              )}

              {participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 text-sm py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-gray-300" />
                  </div>
                  <p>No participants yet</p>
                  <p className="text-xs text-gray-400 mt-1">Participants will appear here when they join</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants
                    .filter((p) => p.isActive)
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className="flex justify-between items-center py-3 px-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 truncate">{participant.name}</span>
                        </div>
                        {userRole === "teacher" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => kickOutParticipant(participant.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 text-xs px-2 py-1 h-7 flex-shrink-0"
                          >
                            Kick out
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 text-center pt-3 border-t bg-gray-50 -mx-4 px-4 py-2 rounded-b-xl flex-shrink-0">
              {participants.filter((p) => p.isActive).length + (userRole === "teacher" ? 1 : 0)} total participant(s)
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  // Welcome Screen
  if (appState === "welcome") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl text-center">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-8">
            ✨ Intervue Poll
          </Badge>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the <span className="font-black">Live Polling System</span>
          </h1>

          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Please select the role that best describes you to begin using the live polling system
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                userRole === "student" ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
              onClick={() => setUserRole("student")}
            >
              <CardContent className="p-8 text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Student</h3>
                <p className="text-gray-600">Submit answers and view live poll results in real-time.</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                userRole === "teacher" ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
              onClick={() => setUserRole("teacher")}
            >
              <CardContent className="p-8 text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">I'm a Teacher</h3>
                <p className="text-gray-600">Create and manage polls, ask questions, and monitor responses.</p>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={() => handleRoleSelection(userRole)}
            disabled={!userRole}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-3 rounded-full text-lg font-semibold"
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  // Setup Screen
  if (appState === "setup") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-8">
            ✨ Intervue Poll
          </Badge>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Let's Get Started</h1>

          {userRole === "student" ? (
            <>
              <p className="text-gray-600 mb-8">
                If you're a student, you'll be able to <span className="font-semibold">submit your answers</span>{" "}
                participate in live polls and see how your responses compare with your classmates
              </p>

              <div className="space-y-4">
                <div className="text-left">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Enter your Name
                  </Label>
                  <Input
                    id="name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Rahul Bajaj"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleStudentSetup}
                  disabled={!studentName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-8">
                you'll have the ability to create and manage polls, ask questions, and monitor your students' responses
                in real-time.
              </p>

              <Button
                onClick={handleTeacherSetup}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold"
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Teacher Dashboard
  if (appState === "teacher-dashboard" && userRole === "teacher") {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-4">
              ✨ Intervue Poll
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="live">Live Poll</TabsTrigger>
                  <TabsTrigger value="results">Poll Results</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="live" className="space-y-6">
                  {currentQuestion && currentQuestion.isActive ? (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Question</h2>
                      <Card>
                        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {currentQuestion.options.map((option, index) => {
                              const votes = currentQuestion.responses[index] || 0
                              const percentage = getPercentage(votes, currentQuestion.totalResponses)

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                      </div>
                                      <span className="font-medium">{option}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{percentage}%</span>
                                  </div>
                                  <Progress value={percentage} className="h-3" />
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Poll</h2>
                      <p className="text-gray-600 mb-6">Create a new question to start polling your students</p>
                      <Button
                        onClick={createNewQuestion}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Question
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="results" className="space-y-6">
                  {currentQuestion && !currentQuestion.isActive ? (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Poll Results</h2>
                      <Card>
                        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {currentQuestion.options.map((option, index) => {
                              const votes = currentQuestion.responses[index] || 0
                              const percentage = getPercentage(votes, currentQuestion.totalResponses)

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                      </div>
                                      <span className="font-medium">{option}</span>
                                    </div>
                                    <span className="text-lg font-bold">{percentage}%</span>
                                  </div>
                                  <Progress value={percentage} className="h-4" />
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={createNewQuestion}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ask New Question
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Yet</h2>
                      <p className="text-gray-600">Complete a poll to see results here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  {pollHistory.length > 0 ? (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Poll History</h2>
                      <div className="space-y-6">
                        {pollHistory.map((poll, index) => (
                          <Card key={poll.id}>
                            <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">{poll.question}</h3>
                                <Badge variant="secondary">Question {pollHistory.length - index}</Badge>
                              </div>
                            </div>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {poll.options.map((option, optionIndex) => {
                                  const votes = poll.responses[optionIndex] || 0
                                  const percentage = getPercentage(votes, poll.totalResponses)

                                  return (
                                    <div key={optionIndex} className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                            {optionIndex + 1}
                                          </div>
                                          <span className="font-medium">{option}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{percentage}%</span>
                                      </div>
                                      <Progress value={percentage} className="h-3" />
                                    </div>
                                  )
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">No Poll History</h2>
                      <p className="text-gray-600">Create and complete polls to see history here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Card>
                <CardContent className="p-4">
                  <Tabs defaultValue="participants" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="participants">Participants</TabsTrigger>
                    </TabsList>

                    <TabsContent value="participants" className="mt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                          <span>Name</span>
                          <span>Action</span>
                        </div>
                        {participants
                          .filter((p) => p.isActive)
                          .map((participant) => (
                            <div key={participant.id} className="flex justify-between items-center py-2">
                              <span className="font-medium">{participant.name}</span>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => kickOutParticipant(participant.id)}
                                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                              >
                                Kick out
                              </Button>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="chat" className="mt-4">
                      <div className="h-64 overflow-y-auto mb-4 space-y-2">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="bg-gray-100 rounded p-2">
                            <div className="font-semibold text-sm text-purple-600">{msg.userName}</div>
                            <div className="text-sm">{msg.message}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Chat Float Button - Only show when chat is closed */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {showChat && <ChatPanel />}
      </div>
    )
  }

  // Teacher Create Question Screen
  if (appState === "create-question" && userRole === "teacher") {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-8">
            ✨ Intervue Poll
          </Badge>

          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setAppState("teacher-dashboard")}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Question</h1>
              <p className="text-gray-600">
                Create and manage polls, ask questions, and monitor responses in real-time.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Enter your question</Label>
                <Select
                  value={newQuestion.timer.toString()}
                  onValueChange={(value) => setNewQuestion((prev) => ({ ...prev, timer: Number.parseInt(value) }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">120 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                placeholder="Enter your question here..."
                className="min-h-32 resize-none"
              />
              <div className="text-right text-sm text-gray-500">{newQuestion.question.length}/100</div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Edit Options</Label>
                  <div className="space-y-3">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder="Enter option"
                          className="flex-1"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More option
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Is it Correct?</Label>
                  <div className="space-y-3">
                    {newQuestion.options.map((_, index) => (
                      <div key={index} className="flex items-center gap-4 h-10">
                        <RadioGroup
                          value={newQuestion.correctAnswers[index] ? "yes" : "no"}
                          onValueChange={(value) => updateCorrectAnswer(index, value === "yes")}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`yes-${index}`} />
                            <Label htmlFor={`yes-${index}`}>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`no-${index}`} />
                            <Label htmlFor={`no-${index}`}>No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              onClick={startQuestion}
              disabled={!newQuestion.question.trim() || !newQuestion.options.every((opt) => opt.trim())}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold"
            >
              Ask Question
            </Button>
          </div>
        </div>

        {/* Chat Float Button - Only show when chat is closed */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {showChat && <ChatPanel />}
      </div>
    )
  }

  // Live Poll Screen (Teacher View)
  if (appState === "live-poll" && userRole === "teacher" && currentQuestion) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-4">
              ✨ Intervue Poll
            </Badge>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setAppState("teacher-dashboard")}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Live Poll</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Question</h2>

              <Card className="mb-6">
                <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                      const votes = currentQuestion.responses[index] || 0
                      const percentage = getPercentage(votes, currentQuestion.totalResponses)

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{option}</span>
                            </div>
                            <span className="text-sm text-gray-500">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-4">
                  <Tabs defaultValue="participants" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="participants">Participants</TabsTrigger>
                    </TabsList>

                    <TabsContent value="participants" className="mt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                          <span>Name</span>
                          <span>Action</span>
                        </div>
                        {participants
                          .filter((p) => p.isActive)
                          .map((participant) => (
                            <div key={participant.id} className="flex justify-between items-center py-2">
                              <span className="font-medium">{participant.name}</span>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => kickOutParticipant(participant.id)}
                                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                              >
                                Kick out
                              </Button>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="chat" className="mt-4">
                      <div className="h-64 overflow-y-auto mb-4 space-y-2">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="bg-gray-100 rounded p-2">
                            <div className="font-semibold text-sm text-purple-600">{msg.userName}</div>
                            <div className="text-sm">{msg.message}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Chat Float Button - Only show when chat is closed */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {showChat && <ChatPanel />}
      </div>
    )
  }

  // Student Waiting Screen
  if (appState === "waiting" && userRole === "student") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-8">
          ✨ Intervue Poll
        </Badge>

        <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mb-8"></div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Wait for the teacher to ask questions..</h1>

        {/* Chat Float Button - Only show when chat is closed */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {showChat && <ChatPanel />}
      </div>
    )
  }

  // Student Answer Screen
  if (appState === "student-answer" && userRole === "student" && currentQuestion) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold">Question 1</h2>
              <Badge variant="destructive" className="mt-2">
                ⏰ {formatTime(timeLeft)}
              </Badge>
            </div>
          </div>

          <Card className="mb-8">
            <div className="bg-gray-800 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full justify-start p-4 h-auto ${
                      selectedAnswer === index
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAnswer(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          selectedAnswer === index
                            ? "bg-white text-purple-600"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span>{option}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold"
            >
              Submit
            </Button>
          </div>
        </div>

        {/* Chat Float Button - Only show when chat is closed */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {showChat && <ChatPanel />}
      </div>
    )
  }

  // Results Screen
  if (appState === "results") {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Poll Results</h1>

          {currentQuestion && (
            <Card>
              <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const votes = currentQuestion.responses[index] || 0
                    const percentage = getPercentage(votes, currentQuestion.totalResponses)

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                          <span className="text-lg font-bold">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-4" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {userRole === "student" && (
            <div className="text-center mt-8">
              <p className="text-gray-600">Wait for the teacher to ask a new question..</p>
            </div>
          )}
        </div>

        {/* Chat Float Button - Only show when chat is closed */}
        {!showChat && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowChat(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>
        )}

        {showChat && <ChatPanel />}
      </div>
    )
  }

  // Kicked Out Screen
  if (appState === "kicked-out") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 mb-8">
          ✨ Intervue Poll
        </Badge>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">You've been Kicked out !</h1>
        <p className="text-gray-600 text-center max-w-md">
          The teacher has removed you from the poll system. Please contact your teacher if you believe this was a
          mistake.
        </p>
      </div>
    )
  }

  return null
}
