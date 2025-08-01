"use client"

import { useState } from "react"

const SetupScreen = ({ userRole, studentName, onStudentSetup, onTeacherSetup }) => {
  const [name, setName] = useState(studentName)

  const handleSubmit = () => {
    if (userRole === "student") {
      onStudentSetup(name)
    } else {
      onTeacherSetup()
    }
  }

  return (
    <div className="setup-screen">
      <div className="setup-container">
        <div className="brand-badge">✨ Intervue Poll</div>

        <h1 className="setup-title">Let's Get Started</h1>

        {userRole === "student" ? (
          <>
            <p className="setup-subtitle">
              If you're a student, you'll be able to <span className="font-bold">submit your answers</span> participate
              in live polls and see how your responses compare with your classmates
            </p>

            <div className="input-group">
              <label htmlFor="name">Enter your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Bajaj"
                className="name-input"
              />
            </div>

            <button className="continue-btn" onClick={handleSubmit} disabled={!name.trim()}>
              Continue
            </button>
          </>
        ) : (
          <>
            <p className="setup-subtitle">
              you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in
              real-time.
            </p>

            <button className="continue-btn" onClick={handleSubmit}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default SetupScreen
