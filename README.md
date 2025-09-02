# 🎯 Priospace

A beautiful, modern productivity app that combines task management with Pomodoro timer functionality, habit tracking, and real-time collaboration. Built with Next.js, React, and Framer Motion for smooth animations and premium user experience.

![Todo Timer](https://img.shields.io/badge/Version-2.1-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)
![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-green)

## ✨ Features

### 📝 Task Management
- Create, edit, and manage tasks and habits
- **Subtasks support** - Break down complex tasks into manageable subtasks
- Organize tasks with custom color-coded categories
- Mark tasks as complete with smooth animations
- Hold-to-complete gesture for mobile-friendly interaction
- Separate sections for regular tasks and habits

### 🌐 Real-time Collaboration (NEW)
- **WebRTC-powered real-time collaboration** for shared workspaces
- Live task updates across multiple users
- Peer-to-peer connection for instant synchronization
- Share tasks and progress with team members in real-time
- No server dependency for peer connections after initial handshake

### ⏱️ Pomodoro Timer
- Customizable timer presets (5, 10, 25, 50 minutes)
- Real-time countdown with animated display
- Overtime tracking for extended work sessions
- Break timer with automatic transitions
- Focus time tracking for productivity insights
- Music player-style controls (play/pause/stop)

### 🔄 Habit Tracking
- GitHub-style contribution graph for 90-day habit history
- Monthly view with visual intensity indicators
- Individual habit tracking with daily completion
- Interactive grid for marking habit completion
- Comprehensive habit analytics and progress visualization

### 🎨 Beautiful UI/UX
- Modern bottom-sheet modal design
- **4 stunning themes** with seamless theme selection
- Smooth spring animations with Framer Motion
- Responsive design optimized for mobile and desktop
- Dark/Light mode support with enhanced theme system
- Primary color theming throughout the app
- Intuitive touch gestures and micro-interactions

### 📊 Data Management
- Export/Import functionality for data backup
- Local storage persistence
- Enhanced settings panel with theme controls
- Motivational intro screen with random quotes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anoyrc/priospace.git
   cd priospace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up WebRTC Server (for collaboration features)**
   ```bash
   cd webrtc-server
   npm install
   npm run start
   ```
   
   The WebRTC signaling server will start on the default port. Make sure this is running before using collaboration features.

4. **Run the development server**
   ```bash
   # Navigate back to root directory
   cd ..
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions

### Real-time Features
- **WebRTC** - Peer-to-peer real-time communication
- **WebSocket** - Signaling server for WebRTC handshake
- **Node.js** - Backend server for WebRTC signaling

### UI Components
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Custom Components** - CountdownTimer, CircleProgress, and modal systems

### State Management
- **React Hooks** - useState, useEffect, useRef for state management
- **Local Storage** - Data persistence in browser
- **Context API** - Theme and global state management

## 📁 Project Structure

```
priospace/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/            # Reusable components
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions and utilities
├── webrtc-server/         # WebRTC signaling server
│   ├── server.js         # Express server with WebSocket support
│   ├── package.json      # Server dependencies
│   └── ...
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🎮 Usage

### Creating Tasks with Subtasks
1. Click the **"Add Task"** button
2. Enter your task title in the borderless input
3. Optionally select or create a category with custom colors
4. **Add subtasks** by clicking the subtask option
5. Break down complex tasks into manageable chunks
6. Click **"Add Task"** to save

### Real-time Collaboration
1. Start the WebRTC server: `cd webrtc-server && npm run start`
2. Share your workspace ID with team members
3. Collaborate in real-time on tasks and projects
4. See live updates as team members make changes
5. All changes sync instantly without page refresh

### Using the Timer
1. Select a task from your list
2. Choose a timer preset (5, 10, 25, or 50 minutes)
3. Use the music player-style controls:
   - **Play/Pause** - Start or pause the timer
   - **Stop** - Reset the timer to original time
   - **Break** - Take a 5-minute break
4. Complete your task when finished

### Tracking Habits
1. Open the **Habit Tracker** from the bottom navigation
2. Add new habits with categories
3. Click on grid squares to mark daily completions
4. View your 90-day progress with GitHub-style visualization
5. Navigate between habit overview and individual habit views

### Theme Selection
1. Access **Settings** to browse 4 beautiful themes
2. Choose from enhanced color schemes
3. Experience seamless theme transitions
4. Themes persist across sessions

### Managing Data
1. Access **Settings** to:
   - Select from 4 stunning themes
   - Toggle between light and dark modes
   - Export your data as JSON backup
   - Import previously exported data
   - Support the developer with "Buy Me a Coffee"

## 🔧 Configuration

### WebRTC Server Setup
The WebRTC server handles signaling for peer connections:

```bash
# Default server configuration
cd webrtc-server
npm install
npm run start
```

For production deployment, configure your server settings in `webrtc-server/server.js`.

### Customizing Themes
The app now supports 4 themes. Update theme configurations in your settings:

```css
:root {
  --primary: your-color-hue your-color-saturation your-color-lightness;
  --theme-variant: your-theme-name;
}
```

### Timer Presets
Modify the timer presets in `TimerModal.tsx`:

```javascript
const presets = [
  { value: "5", label: "5 min", seconds: 5 * 60 },
  { value: "15", label: "15 min", seconds: 15 * 60 },
  // Add your custom presets
];
```

### Subtask Configuration
Customize subtask behavior in your task components:

```javascript
const maxSubtasks = 10; // Limit subtasks per task
const subtaskDepth = 2;  // Maximum nesting level
```

## 🌐 WebRTC Server Instructions

### Development Setup
1. **Navigate to the WebRTC server directory**
   ```bash
   cd webrtc-server
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Start the signaling server**
   ```bash
   npm run start
   ```

The server will handle WebRTC signaling for real-time collaboration features. Make sure it's running before using collaborative workspaces.

### Production Deployment
For production deployment of the WebRTC server:

1. Configure your production environment variables
2. Set up proper CORS policies
3. Use process managers like PM2 for server stability
4. Consider using HTTPS for secure WebRTC connections

## 📱 Progressive Web App Features

- Responsive design for mobile and desktop
- Touch gestures and mobile-optimized interactions
- Offline-ready with local storage persistence
- Fast loading with Next.js optimization
- Real-time collaboration that works across devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and component patterns
- Use TypeScript for type safety
- Add appropriate animations with Framer Motion
- Ensure responsive design works on all screen sizes
- Test all 4 themes for consistency
- Test WebRTC functionality with multiple peers
- Maintain accessibility standards
- Test subtask functionality thoroughly

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/anoyrc/priospace/issues) page to:
- Report bugs with detailed reproduction steps
- Request new features with clear use cases
- Discuss improvements and suggestions
- Report WebRTC connection issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Framer Motion** for smooth animations
- **Lucide** for the icon set
- **Tailwind CSS** for the utility-first styling approach
- **Next.js** team for the amazing React framework
- **WebRTC** community for real-time communication standards

## 💖 Support

If you find this project helpful, consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features
- ☕ [Buying me a coffee](https://coff.ee/anoy)
- 🐦 Following [@Anoyroyc](https://x.com/Anoyroyc) on Twitter

---

<div align="center">

### 🎯 vibecoded

**Coded with ❤️ by [Anoy Roy Chowdhury](https://x.com/Anoyroyc)**

*Focus • Track • Achieve • Collaborate*

</div>