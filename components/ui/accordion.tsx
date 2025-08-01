"use client"

import { useState } from "react"

const ChatPanel = ({ participants, chatMessages, onSendMessage, onKickStudent, isTeacher }) => {
  const [activeTab, setActiveTab] = useState("participants")
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-tabs">
        <button className={`chat-tab ${activeTab === "chat" ? "active" : ""}`} onClick={() => setActiveTab("chat")}>
          Chat
        </button>
        <button
          className={`chat-tab ${activeTab === "participants" ? "active" : ""}`}
          onClick={() => setActiveTab("participants")}
        >
          Participants
        </button>
      </div>

      {activeTab === "participants" && (
        <div className="participants-panel">
          <div className="participants-header">
            <span>Name</span>
            {isTeacher && <span>Action</span>}
          </div>
          <div className="participants-list">
            {participants
              .filter((p) => p.isActive)
              .map((participant) => (
                <div key={participant.id} className="participant-item">
                  <span className="participant-name">{participant.name}</span>
                  {isTeacher && (
                    <button onClick={() => onKickStudent(participant.id)} className="kick-btn">
                      Kick out
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="chat-panel-content">
          <div className="chat-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <div className="message-header">
                  <span className="message-user">{msg.userName}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="message-input"
            />
            <button onClick={handleSendMessage} className="send-btn">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPanel
