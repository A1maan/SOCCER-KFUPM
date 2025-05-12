# SOCCER@KFUPM

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Contributors](#contributors)

---

## Project Overview
**SOCCER@KFUPM** is a web application designed to provide KFUPM users with an interactive platform to explore soccer tournaments, match results, team details, and top goal scorers at KFUPM. The application supports multiple user roles, including guests and admins, and offers quick access to essential soccer-related information.

---

## Features
- **Guest Login**: Allows users to log in as a guest and access soccer-related features.
- **Admin Dashboard**: Enables admins to manage tournaments, teams, venues, and match details.
- **Quick Access Dashboard**: Provides shortcuts to view tournament tables, match results, team details, and top goal scorers.
- **Dynamic Navigation**: Enables seamless navigation between different pages.
- **Responsive Design**: Optimized for various screen sizes and devices.

---

## Technologies Used
- **Frontend**: React.js, React Router, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Styling**: CSS, custom stylesheets
- **Development Tools**: Visual Studio Code, Node.js, npm

---

## Folder Structure
```
ICS321_Project/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Backend logic for various entities
│   ├── middleware/      # Middleware for async handling and authentication
│   ├── routes/          # API routes for different modules
│   ├── server.js        # Entry point for the backend server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Pages for Admin and Guest users
│   │   ├── stylesheets/ # CSS files for styling
│   │   ├── App.jsx      # Main React application file
│   │   ├── main.jsx     # React entry point
├── README.md            # Project documentation
├── package.json         # Project dependencies and scripts
```

---

## Setup Instructions
Follow these steps to set up the project locally:

### Backend Setup
1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Up the Database**:
   - Ensure PostgreSQL is installed and running.
   - Create a database and update the connection details in `backend/config/db.js`.
   - Run the provided SQL schema file `tournament_db_serial_schema.sql` to set up the database structure.
4. **Start the Backend Server**:
   ```bash
   npm start
   ```

### Frontend Setup
1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
4. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

---

## Usage

### Guest User
1. **Login**:
   - Navigate to the Guest Login page.
   - Enter the guest credentials (e.g., `username: s20xxxxxxx`, `password: guest123`).
   - Upon successful login, you will be redirected to the Guest Home page.

2. **Functionalities**:
   - **View Tournament Table**: Access the tournament standings.
   - **Browse Match Results**: View results of past matches.
   - **Browse Teams**: Explore team details and rosters.
   - **View Top Goal Scorers**: Check the leaderboard for top scorers.

### Admin User
1. **Login**:
   - Navigate to the Admin Login page.
   - Enter the admin credentials (e.g., `username: adminfirstname.adminlastname.adminid`, `password: admin123`).
   - Upon successful login, you will be redirected to the Admin Dashboard.

2. **Functionalities**:
   - **Manage Tournaments**: Add, edit, or delete tournament details.
   - **Manage Teams**: Add, edit, or delete team information.
   - **Manage Venues**: Add, edit, or delete venue details.
   - **Manage Matches**: Schedule, edit, or delete match details.
   - **View Reports**: Access detailed reports on matches, teams, and tournaments.

---

<!-- ## Known Issues
- **Hot Reload Failure**: Occasionally, the development server (`vite`) fails to reload changes. Restart the server to resolve this issue.
- **Static Username**: Some usernames in the frontend are currently hardcoded. This will be replaced with dynamic data in future updates.

---

## Future Enhancements
- Implement dynamic user authentication and session management.
- Add support for additional user roles (e.g., team manager).
- Enhance the UI with animations and improved responsiveness.
- Integrate a backend API for real-time data updates.

--- -->

## Contributors
- **Almaan Khan**: <br>
  → Frontend Developer, <br>
  → Backend Developer (partially contributed)
  
- **Husain Althagafi**: <br>
  → Backend Developer

---

## License
This project is for educational purposes and is not licensed for commercial use.
