"use client"

import { useState } from "react"

const CreatePollForm = ({ onCreatePoll }) => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [correctAnswers, setCorrectAnswers] = useState([false, false])
  const [timer, setTimer] = useState(60)

  const addOption = () => {
    setOptions([...options, ""])
    setCorrectAnswers([...correctAnswers, false])
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const updateCorrectAnswer = (index, isCorrect) => {
    const newCorrectAnswers = [...correctAnswers]
    newCorrectAnswers[index] = isCorrect
    setCorrectAnswers(newCorrectAnswers)
  }

  const handleSubmit = () => {
    if (question.trim() && options.every((opt) => opt.trim())) {
      onCreatePoll({
        id: Date.now().toString(),
        question: question.trim(),
        options: options.filter((opt) => opt.trim()),
        correctAnswers,
        timer,
      })
    }
  }

  return (
    <div className="create-poll-form">
      <div className="form-container">
        <h1>Let's Get Started</h1>
        <p>
          you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in
          real-time.
        </p>

        <div className="form-content">
          <div className="form-left">
            <div className="form-group">
              <div className="form-header">
                <label>Enter your question</label>
                <select value={timer} onChange={(e) => setTimer(Number(e.target.value))} className="timer-select">
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="question-input"
                maxLength={100}
              />
              <div className="char-count">0/100</div>
            </div>
          </div>

          <div className="form-right">
            <div className="options-section">
              <div className="section-header">
                <h3>Edit Options</h3>
                <h3>Is it Correct?</h3>
              </div>

              <div className="options-list">
                {options.map((option, index) => (
                  <div key={index} className="option-row">
                    <div className="option-input-group">
                      <div className="option-number">{index + 1}</div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder="Enter option"
                        className="option-input"
                      />
                    </div>

                    <div className="correct-options">
                      <label className="radio-group">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={correctAnswers[index]}
                          onChange={() => updateCorrectAnswer(index, true)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="radio-group">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={!correctAnswers[index]}
                          onChange={() => updateCorrectAnswer(index, false)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addOption} className="add-option-btn">
                  + Add More option
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || !options.every((opt) => opt.trim())}
            className="ask-question-btn"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePollForm
