"use client"

const LivePoll = ({ currentPoll, canCreateNew, onCreateNew }) => {
  const getPercentage = (votes, total) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100)
  }

  if (!currentPoll) {
    return (
      <div className="no-poll">
        <h2>No Active Poll</h2>
        <button onClick={onCreateNew} className="create-poll-btn">
          + Create New Poll
        </button>
      </div>
    )
  }

  return (
    <div className="live-poll">
      <h2>Question</h2>

      <div className="poll-card">
        <div className="poll-question">{currentPoll.question}</div>

        <div className="poll-options">
          {currentPoll.options.map((option, index) => {
            const votes = currentPoll.responses[index] || 0
            const percentage = getPercentage(votes, currentPoll.totalResponses)

            return (
              <div key={index} className="poll-option">
                <div className="option-header">
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

      {canCreateNew && (
        <div className="poll-actions">
          <button onClick={onCreateNew} className="create-poll-btn">
            + Ask a new question
          </button>
        </div>
      )}
    </div>
  )
}

export default LivePoll
