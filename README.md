# ONSET

ONSET is a performance-oriented task management system designed to convert complex exam syllabi into structured, daily executable plans. By utilizing a high-contrast, industrial design language, the platform minimizes cognitive load and prioritizes user focus on long-term academic consistency.

## Problem Statement
Students often face "starting friction" when beginning exam preparation, spending more time organizing complex syllabi than actually studying. Traditional productivity tools frequently use cluttered, overly decorative interfaces that distract from high-stakes goals. There is a critical need for a streamlined, high-contrast system that removes visual noise and provides a direct, executable roadmap from a broad syllabus to daily tasks.

## 🚀 Key Features Built for the Hackathon
1. **AI Syllabus Decomposition**: A Node.js backend Engine hooks into the OpenAI API to dynamically digest user inputs (Exam, Timeframe, Weak Areas, Consistency Level) and splits them into granular, actionable daily task modules.
2. **Neo-Brutalist Design System**: A strict, uncompromised industrial aesthetic. High-contrast shapes, pastel mints/yellows, hard drop-shadows, and tactile micro-animations remove all conventional UI clutter to force total focus.
3. **Consistency Tracker Grid**: A rigid, perfectly-aligned responsive calendar that visualizes daily discipline (Greens = Done, Mints = Deadlines).
4. **Dynamic Physics & Alerts**: Floating active plan tags (`V-Urgent`, `Tracking`) auto-calculate based on deadline proximity and feature violent recoil animations on hover.

## Tech Stack
### Frontend
- **Structure**: Vanilla HTML/CSS with absolutely zero bloat (No Tailwind, No Bootstrap).
- **Styling**: Pure CSS Grid & Flexbox, leveraging exact Space Grotesk typography and CSS variable tokens for the pastel Brutalist theme.
- **Logic**: Vanilla JavaScript orchestrating MVP state via `localStorage`, dynamic AI fetching, and interactive `DOM` updates.

### Backend (AI Engine)
- **Server**: Node.js & Express.js running on Port 3000.
- **Integration**: OpenAI API configured with Custom System Prompts mapped to auto-scale task intensity based on the user's selected study consistency.
## How to Run

To run the full application, you need to start both the **Backend Engine** and the **Frontend UI** in two separate terminal windows.

### 1. Start the Backend (API)
Open a terminal and run:
```bash
cd backend
npx -y node@18 server.js
```
*Note: Ensure your OpenAI API key is in `backend/.env`.*

### 2. Start the Frontend (UI)
Open a **second** terminal and run:
```bash
npx -y serve@13 ./frontend
```
*Then visit the URL provided (usually `http://localhost:3000` or `5000`).*
