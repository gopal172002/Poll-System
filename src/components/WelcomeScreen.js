"use client"

const WelcomeScreen = ({ onRoleSelect, selectedRole }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="brand-badge">✨ Intervue Poll</div>

        <h1 className="welcome-title">
          Welcome to the <span className="title-bold">Live Polling System</span>
        </h1>

        <p className="welcome-subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-cards">
          <div
            className={`role-card ${selectedRole === "student" ? "selected" : ""}`}
            onClick={() => onRoleSelect("student")}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div
            className={`role-card ${selectedRole === "teacher" ? "selected" : ""}`}
            onClick={() => onRoleSelect("teacher")}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view live poll results in real-time.</p>
          </div>
        </div>

        <button className="continue-btn" onClick={() => onRoleSelect(selectedRole)} disabled={!selectedRole}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen
