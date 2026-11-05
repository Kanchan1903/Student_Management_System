# 🎓 Student Information Management System

A full-stack **three-tier cloud architecture** application for managing student records.

| Tier | Technology | Hosting |
|------|-----------|---------|
| **Frontend** | React.js + Vite | Netlify |
| **Backend** | Node.js + Express.js | Render |
| **Database** | MongoDB Atlas | Cloud |

---

## 📁 Project Structure

```
student-management-system/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env.example           # Environment variable template
│   ├── .gitignore
│   ├── config/
│   │   └── database.js        # MongoDB Atlas connection
│   ├── models/
│   │   └── Student.js         # Mongoose schema
│   ├── routes/
│   │   └── studentRoutes.js   # API routes
│   └── controllers/
│       └── studentController.js # CRUD logic
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── netlify.toml           # Netlify build config
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── StudentForm.jsx
│       │   ├── Modal.jsx
│       │   ├── Notification.jsx
│       │   └── LoadingSpinner.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Students.jsx
│       │   └── AddStudent.jsx
│       ├── services/
│       │   └── api.js         # Axios API calls
│       └── styles/
│           └── global.css
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier is fine)

### Step 1 — MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in.
2. Click **"Build a Database"** → choose **Free (M0 Shared)** → select a cloud region.
3. **Create a Database User**:
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Set username (e.g., `studentuser`) and a strong password
   - Grant role: **Read and write to any database**
4. **Configure Network Access**:
   - Go to **Network Access** → **Add IP Address**
   - For local dev: add your current IP
   - For Render deployment: add `0.0.0.0/0` (allow all) or specific Render IPs
5. **Get the Connection String**:
   - Go to **Clusters** → **Connect** → **Connect your application**
   - Choose **Node.js** driver
   - Copy the URI, it looks like:
     ```
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials
   - The database name `studentDB` is set in `config/database.js`

### Step 2 — Backend Setup

```bash
cd student-management-system/backend
npm install

# Create your .env file from the example
copy .env.example .env   # Windows
# OR
cp .env.example .env     # Mac/Linux
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://studentuser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Student Management API is running.",
  "timestamp": "...",
  "environment": "development"
}
```

### Step 3 — Frontend Setup

```bash
cd student-management-system/frontend
npm install

# Create your .env file
copy .env.example .env   # Windows
# For local dev, the default value (empty) uses the Vite proxy
```

`frontend/.env` for **local development** (uses Vite proxy):
```env
# Leave empty or comment out to use local backend via Vite proxy
# VITE_API_URL=
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/students` | Get all students (supports `?search=`, `?department=`, `?semester=`) |
| `GET` | `/api/students/stats` | Dashboard statistics |
| `GET` | `/api/students/:id` | Get student by MongoDB `_id` |
| `POST` | `/api/students` | Create a new student |
| `PUT` | `/api/students/:id` | Update a student |
| `DELETE` | `/api/students/:id` | Delete a student |

### Request Body (POST/PUT)
```json
{
  "studentId": "CS2024001",
  "name": "Priya Sharma",
  "email": "priya@university.edu",
  "department": "Computer Science",
  "semester": 3,
  "contact": "+91 9876543210"
}
```

### API Testing Examples (curl)

```bash
# Health check
curl http://localhost:5000/api/health

# Create student
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{"studentId":"CS001","name":"Raj Kumar","email":"raj@uni.edu","department":"Computer Science","semester":2}'

# Get all students
curl http://localhost:5000/api/students

# Search students
curl "http://localhost:5000/api/students?search=raj"

# Update student (replace <MONGO_ID> with actual _id from DB)
curl -X PUT http://localhost:5000/api/students/<MONGO_ID> \
  -H "Content-Type: application/json" \
  -d '{"studentId":"CS001","name":"Raj Kumar","email":"raj@uni.edu","department":"Information Technology","semester":3}'

# Delete student
curl -X DELETE http://localhost:5000/api/students/<MONGO_ID>

# Dashboard stats
curl http://localhost:5000/api/students/stats
```

---

## ☁️ Deployment

### Deploy Backend to Render

1. Push your code to GitHub (ensure `backend/.env` is in `.gitignore` — it is).
2. Go to [https://render.com](https://render.com) and sign up / log in.
3. Click **"New"** → **"Web Service"**.
4. Connect your GitHub repository.
5. Configure:
   - **Name**: `student-management-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
6. Add **Environment Variables**:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `PORT` = `5000` (Render may override this automatically)
   - `FRONTEND_URL` = (leave blank for now, update after Netlify deploy)
   - `NODE_ENV` = `production`
7. Click **"Create Web Service"**.
8. Wait for deployment — you'll get a URL like: `https://student-management-backend.onrender.com`
9. Test the deployed health endpoint:
   ```
   https://your-render-url.onrender.com/api/health
   ```
10. Go back to Render **Environment Variables** and set:
    - `FRONTEND_URL` = your Netlify URL (after deploying frontend)

### Deploy Frontend to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) and sign up / log in.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Connect your GitHub repository.
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add **Environment Variables**:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://student-management-backend.onrender.com`)
6. Click **"Deploy site"**.
7. Your site will be deployed at a URL like: `https://your-site.netlify.app`
8. Go back to Render and update `FRONTEND_URL` to this Netlify URL.
9. Also go back to MongoDB Atlas **Network Access** and ensure Render's IPs are allowed.

> **Note**: On Render's free tier, the service "sleeps" after 15 minutes of inactivity.
> The first request after sleep may take 30–60 seconds to respond.

---

## ✅ Testing Checklist

### Functional Tests

- [ ] 1. Add a new student with all required fields
- [ ] 2. Verify the student appears in the student list
- [ ] 3. Search for a student by name
- [ ] 4. Search for a student by student ID
- [ ] 5. Edit a student's department and semester
- [ ] 6. Delete a student (confirm dialog appears)
- [ ] 7. Confirm deleted student no longer appears in the list
- [ ] 8. Try adding a student with a duplicate Student ID → expect error
- [ ] 9. Try adding a student with a duplicate email → expect error
- [ ] 10. Submit the form with missing required fields → expect validation error
- [ ] 11. Submit with an invalid email format → expect validation error
- [ ] 12. Stop the backend server and verify the frontend shows a proper error

### API Tests

- [ ] `GET /api/health` returns `{ success: true }`
- [ ] `POST /api/students` with valid data returns `201 Created`
- [ ] `POST /api/students` with duplicate studentId returns `409 Conflict`
- [ ] `GET /api/students` returns array of students
- [ ] `GET /api/students?search=<name>` filters correctly
- [ ] `GET /api/students/:id` returns one student
- [ ] `GET /api/students/invalid-id` returns `400 Bad Request`
- [ ] `GET /api/students/000000000000000000000000` (non-existent) returns `404 Not Found`
- [ ] `PUT /api/students/:id` updates the record in MongoDB Atlas
- [ ] `DELETE /api/students/:id` removes the record from MongoDB Atlas

### End-to-End Deployment Tests

- [ ] Netlify frontend loads at your `.netlify.app` URL
- [ ] Frontend successfully calls Render backend (no CORS errors)
- [ ] Add a student from the deployed frontend → verify it appears in MongoDB Atlas collection `students` in database `studentDB`
- [ ] Dashboard stats update correctly after CRUD operations

---

## 🔒 Security Notes

- MongoDB credentials are **never** exposed to the frontend
- `.env` files are git-ignored
- CORS is configured to only allow the specified Netlify origin
- Input is validated on both frontend and backend
- Error responses do not expose stack traces or credentials in production

---

## 🛠️ Student Data Model

```
studentId  : String  — unique, required, uppercase
name       : String  — required, 2-100 chars
email      : String  — unique, required, valid email format
department : String  — required, enum list
semester   : Number  — required, 1-8
contact    : String  — optional, 7-15 digits
createdAt  : Date    — auto-generated
updatedAt  : Date    — auto-generated
```

---

## 🤖 MCP Server (AI Agent Integration)

This project ships with an **MCP (Model Context Protocol) server** that exposes all student CRUD operations as AI-callable tools.

### Available Tools

| Tool | Description |
|------|-------------|
| `list_students` | Get all students — supports `search`, `department`, `semester`, `page`, `limit` filters |
| `get_student` | Fetch a single student by MongoDB `_id` |
| `get_stats` | Dashboard stats (totals, by department, by semester, recent count) |
| `create_student` | Add a new student record |
| `update_student` | Update an existing student by `_id` |
| `delete_student` | Delete a student by `_id` |

### Running the MCP Server

Make sure the backend REST API is running first (`npm run dev` in `/backend`), then:

```bash
cd student-management-system/backend
npm run mcp
```

Or run it directly:
```bash
node mcp-server.js
```

### Connecting to Claude Desktop

Add this to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "student-management": {
      "command": "node",
      "args": ["<absolute-path>/student-management-system/backend/mcp-server.js"],
      "env": {
        "BACKEND_URL": "http://localhost:5000"
      }
    }
  }
}
```

### Environment Variable

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://localhost:5000` | URL of the running Express REST API |

---

## 📞 Support

This project was built as a demonstration of a three-tier cloud architecture:
- **React.js** (Frontend) on **Netlify**
- **Node.js + Express.js** (Backend) on **Render**
- **MongoDB Atlas** (Database) on Cloud

All CRUD operations interact with the real MongoDB Atlas database through the REST API.
#   S t u d e n t _ M a n a g e m e n t _ S y s t e m  
 