"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setSelectedAnswer } from "../store/slices/userSlice"

const StudentDashboard = ({ onSubmitAnswer, onSendMessage }) => {
  const dispatch = useDispatch()
  const { name, hasAnswered, selectedAnswer } = useSelector((state) => state.user)
  const { currentPoll } = useSelector((state) => state.poll)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (currentPoll && currentPoll.isActive) {
      const startTime = new Date(currentPoll.createdAt).getTime()
      const endTime = startTime + currentPoll.timer * 1000
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      setTimeLeft(remaining)

      const timer = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
        setTimeLeft(remaining)

        if (remaining <= 0) {
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentPoll])

  const handleAnswerSelect = (optionIndex) => {
    dispatch(setSelectedAnswer(optionIndex))
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      onSubmitAnswer(selectedAnswer)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getPercentage = (votes, total) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100)
  }

  // Waiting for question
  if (!currentPoll) {
    return (
      <div className="student-waiting">
        <div className="waiting-container">
          <div className="brand-badge">✨ Intervue Poll</div>
          <div className="loading-spinner"></div>
          <h1>Wait for the teacher to ask questions..</h1>
        </div>
        <div className="chat-float-btn">💬</div>
      </div>
    )
  }

  // Active question - can answer
  if (currentPoll.isActive && !hasAnswered) {
    return (
      <div className="student-answer">
        <div className="answer-container">
          <div className="question-header">
            <div className="question-info">
              <h2>Question 1</h2>
              <div className="timer-badge">⏰ {formatTime(timeLeft)}</div>
            </div>
          </div>

          <div className="question-card">
            <div className="question-title">{currentPoll.question}</div>
            <div className="options-list">
              {currentPoll.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === index ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="option-number">{index + 1}</div>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null || timeLeft === 0}
          >
            Submit
          </button>
        </div>
        <div className="chat-float-btn">💬</div>
      </div>
    )
  }

  // Show results after answering or time up
  return (
    <div className="student-results">
      <div className="results-container">
        <div className="question-header">
          <h2>Question 1</h2>
          <div className="timer-badge completed">⏰ {formatTime(timeLeft)}</div>
        </div>

        <div className="question-card">
          <div className="question-title">{currentPoll.question}</div>
          <div className="results-list">
            {currentPoll.options.map((option, index) => {
              const votes = currentPoll.responses[index] || 0
              const percentage = getPercentage(votes, currentPoll.totalResponses)

              return (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <div className="option-info">
                      <div className="option-number">{index + 1}</div>
                      <span>{option}</span>
                    </div>
                    <span className="percentage">{percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="waiting-message">Wait for the teacher to ask a new question..</div>
      </div>
      <div className="chat-float-btn">💬</div>
    </div>
  )
}

export default StudentDashboard
