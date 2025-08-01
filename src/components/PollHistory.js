const PollHistory = ({ pollHistory }) => {
  const getPercentage = (votes, total) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100)
  }

  if (pollHistory.length === 0) {
    return (
      <div className="no-history">
        <h2>No Poll History</h2>
        <p>Create and complete polls to see history here.</p>
      </div>
    )
  }

  return (
    <div className="poll-history">
      <h2>View Poll History</h2>

      <div className="history-list">
        {pollHistory.map((poll, index) => (
          <div key={poll.id} className="history-item">
            <h3>Question {index + 1}</h3>

            <div className="poll-card">
              <div className="poll-question">{poll.question}</div>

              <div className="poll-options">
                {poll.options.map((option, optionIndex) => {
                  const votes = poll.responses[optionIndex] || 0
                  const percentage = getPercentage(votes, poll.totalResponses)

                  return (
                    <div key={optionIndex} className="poll-option">
                      <div className="option-header">
                        <div className="option-info">
                          <div className="option-number">{optionIndex + 1}</div>
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default PollHistory
