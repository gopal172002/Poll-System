# Live Polling System

A real-time polling system built with React and Socket.io for the Intervue.io SDE Intern assignment.

## Features

### Teacher Features
- Create polls with multiple choice questions
- Set configurable timer (30-120 seconds)
- View live polling results with real-time updates
- Manage participants (kick out students)
- Chat with students
- View poll history
- Mark correct answers

### Student Features
- Join with unique name
- Answer questions within time limit
- View live results after submission
- Chat with teacher and other students
- Real-time updates and notifications

## Technology Stack

- **Frontend**: React 18
- **Backend**: Express.js + Socket.io
- **Real-time Communication**: WebSockets
- **Styling**: Custom CSS with responsive design

## Installation & Setup

### Backend Setup
1. Navigate to server directory:
   \`\`\`bash
   cd server
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`
   Server will run on http://localhost:5000

### Frontend Setup
1. Navigate to root directory and install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the React app:
   \`\`\`bash
   npm start
   \`\`\`
   App will run on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Select your role (Teacher or Student)
3. Follow the setup process
4. Teachers can create polls, students can join and answer
5. Real-time results and chat functionality available

## Project Structure

\`\`\`
├── server/
│   ├── server.js          # Express + Socket.io server
│   └── package.json       # Backend dependencies
├── src/
│   ├── components/        # React components
│   ├── App.js            # Main app component
│   ├── App.css           # Styling
│   └── index.js          # React entry point
└── package.json          # Frontend dependencies
\`\`\`

## Key Features Implemented

✅ Role-based access (Teacher/Student)  
✅ Real-time polling with Socket.io  
✅ Timer-based questions (configurable)  
✅ Live results with progress bars  
✅ Participant management  
✅ Chat functionality  
✅ Poll history  
✅ Responsive design  
✅ Kick out functionality  
✅ Real-time updates  

## Assignment Requirements Met

- ✅ Functional system with all core features
- ✅ React frontend with proper state management
- ✅ Express.js backend with Socket.io
- ✅ Teacher can create polls and view results
- ✅ Students can answer and view results
- ✅ 60-second timer implementation
- ✅ Real-time communication
- ✅ Participant management
- ✅ Chat functionality
- ✅ Poll history (not stored locally)
- ✅ Responsive UI matching Figma design

## Deployment Ready

The application is ready for deployment on platforms like:
- Frontend: Vercel, Netlify
- Backend: Heroku, Railway, Render

## Author

Created for Intervue.io SDE Intern Assignment - Round 1
w