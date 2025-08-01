"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import CreatePollForm from "./CreatePollForm"
import LivePoll from "./LivePoll"
import ChatPanel from "./ChatPanel"
import PollHistory from "./PollHistory"

const TeacherDashboard = ({ onCreatePoll, onSendMessage, onKickStudent }) => {
  const [activeTab, setActiveTab] = useState("live")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { currentPoll, participants, pollHistory } = useSelector((state) => state.poll)
  const { messages } = useSelector((state) => state.chat)

  const canCreateNewPoll = !currentPoll || !currentPoll.isActive

  const handleCreatePoll = (pollData) => {
    onCreatePoll(pollData)
    setShowCreateForm(false)
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div className="brand-badge">✨ Intervue Poll</div>
        <h1>Teacher Dashboard</h1>
      </div>

      <div className="dashboard-content">
        {showCreateForm ? (
          <CreatePollForm onCreatePoll={handleCreatePoll} />
        ) : (
          <div className="dashboard-main">
            <div className="main-content">
              <div className="tabs">
                <button className={`tab ${activeTab === "live" ? "active" : ""}`} onClick={() => setActiveTab("live")}>
                  Live Poll
                </button>
                <button
                  className={`tab ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  Poll History
                </button>
              </div>

              {activeTab === "live" && (
                <LivePoll canCreateNew={canCreateNewPoll} onCreateNew={() => setShowCreateForm(true)} />
              )}

              {activeTab === "history" && <PollHistory />}
            </div>

            <div className="sidebar">
              <ChatPanel
                participants={participants}
                chatMessages={messages}
                onSendMessage={onSendMessage}
                onKickStudent={onKickStudent}
                isTeacher={true}
              />
            </div>
          </div>
        )}
      </div>

      <div className="chat-float-btn">💬</div>
    </div>
  )
}

export default TeacherDashboard
