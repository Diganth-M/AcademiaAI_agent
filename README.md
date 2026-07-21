# AcademiaAI agent - Full Stack Project 🚀

A complete, full-stack web application designed to help students learn better. By uploading their class notes or PDFs, students can utilize AI to automatically extract text, explain chapters, generate assignments, create MCQs, and prepare for vivas.

---

## 📂 Complete Folder Structure

```text
AcademiaAI agent/
│
├── assignment-helper-backend/          # Java Spring Boot Backend
│   ├── src/main/java/com/assignmenthelper/
│   │   ├── AssignmentHelperApplication.java # Application Entry Point
│   │   ├── controller/                 # REST APIs
│   │   │   ├── AuthController.java
│   │   │   ├── DocumentController.java
│   │   │   └── AgentController.java
│   │   ├── dto/                        # Data Transfer Objects
│   │   ├── model/                      # JPA Entities (User, Document, Generation)
│   │   ├── repository/                 # Spring Data Repositories
│   │   ├── security/                   # JWT Auth, Filters, Configuration
│   │   └── service/                    # Business Logic
│   │       ├── AiService.java          # OpenAI API Integration
│   │       ├── DocumentService.java    # File Storage & Retrieval
│   │       └── PdfService.java         # Apache PDFBox Text Extraction
│   ├── src/main/resources/
│   │   ├── application.properties      # Environment variables & DB Config
│   │   └── schema.sql                  # Database Schema Definitions
│   └── pom.xml                         # Maven Dependencies
│
└── assignment-helper-frontend/         # React.js Frontend (Vite)
    ├── src/
    │   ├── components/                 # Reusable UI (Navbar, Sidebar)
    │   ├── context/                    # AuthContext for Global State
    │   ├── pages/                      # Application Views
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx           # Upload UI
    │   │   ├── DocumentView.jsx        # AI Outputs (Explain, MCQ, etc.)
    │   │   └── History.jsx             # Historical Generations
    │   ├── services/                   # Axios API Configuration
    │   ├── styles/                     # Pure CSS (Glassmorphism + Dark Mode)
    │   ├── App.jsx                     # React Router Setup
    │   └── main.jsx                    # React DOM Entry
    ├── package.json                    # NPM Dependencies
    └── vite.config.js                  # Vite Build Config
```

---

## 🗄️ Database Setup

Ensure you have a local instance of MySQL running on default port `3306`.

1. Log into your MySQL server:
   ```bash
   mysql -u root -p
   ```
2. Run the initialization script (or let Hibernate auto-generate it):
   ```sql
   CREATE DATABASE assignment_helper;
   ```
The tables (`users`, `documents`, `generations`) will be automatically created upon Spring Boot startup based on the `@Entity` classes.

---

## 🔐 Environment Variables

### Backend (`assignment-helper-backend/src/main/resources/application.properties`)
Modify the properties file to match your local setup:
```properties
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/assignment_helper
spring.datasource.username=root
spring.datasource.password=root

# JWT Configuration
app.jwt.secret=your_super_secret_base64_encoded_jwt_key_here
app.jwt.expiration-ms=86400000

# Gemini Configuration
# YOU MUST EXPORT THIS AS AN ENVIRONMENT VARIABLE BEFORE RUNNING
gemini.api.key=${GEMINI_API_KEY}
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent

# File Upload Configuration
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
file.upload-dir=uploads/
```

### Frontend (`assignment-helper-frontend/src/services/api.js`)
If you change the backend port, ensure the Axios base URL matches:
```javascript
const API_URL = 'http://localhost:8080/api';
```

---

## 📡 API Documentation

### Authentication (`/api/auth`)
- `POST /register`: Registers a new user. Expects `{ username, email, password }`.
- `POST /login`: Authenticates a user. Expects `{ username, password }`. Returns a JWT token.

### Documents (`/api/documents`) *(Requires JWT)*
- `POST /upload`: Uploads a `multipart/form-data` file. Parses PDF using PDFBox and stores locally. Returns Document object.
- `GET /history`: Returns a list of all documents uploaded by the authenticated user.
- `GET /{id}`: Retrieves a specific document and its extracted text.

### Agent Generations (`/api/agent`) *(Requires JWT)*
- `POST /generate`: Instructs the AI to process a document. 
  - Expects `{ documentId, type, additionalPrompt }`. 
  - Types allowed: `EXPLANATION`, `ASSIGNMENT`, `MCQ`, `VIVA`.
- `GET /history/{documentId}`: Retrieves all previously generated AI outputs for a specific document.

---

## 🏃 Run Commands

### 1. Start the Backend
Open a terminal, set your Gemini API key, and start Spring Boot:
```bash
cd backend
# On Windows (PowerShell):
$env:GEMINI_API_KEY="your-actual-api-key"
# On Mac/Linux:
export GEMINI_API_KEY="your-actual-api-key"

mvn clean spring-boot:run
```

### 2. Start the Frontend
Open a second terminal, install dependencies, and start Vite:
```bash
cd assignment-helper-frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🧪 Testing Steps

1. **Verify Backend**: Check your terminal for `Started AssignmentHelperApplication in X seconds`.
2. **Account Creation**: Go to `http://localhost:5173/register` and create an account.
3. **Login**: Go to `/login` and authenticate. Ensure the Dashboard loads and the JWT is stored in `localStorage`.
4. **File Upload**: On the Dashboard, upload a `.pdf` file (e.g., lecture notes). Wait for the upload to complete; you should be redirected to the Document View.
5. **AI Generation**: Click **Generate Explanation**. Wait for the API to process and verify that the Gemini response is rendered beautifully on the screen.
6. **Check History**: Click the "History" tab on the sidebar to ensure your uploaded document and generated output were successfully persisted in the database.

---

## 🚀 Future Improvements

- **Vector Database (RAG):** Instead of sending the entire document context in every prompt, implement a Vector Database (like Pinecone or Milvus) to utilize Retrieval-Augmented Generation for massive textbook PDFs.
- **WebSocket Streaming:** Instead of making the user wait for the entire Gemini response to generate, use Server-Sent Events (SSE) or WebSockets to stream the AI tokens directly to the React UI in real-time.
- **Export to PDF:** Allow students to export their generated assignments or MCQs into a neatly formatted downloadable PDF document.
- **Cloud Storage:** Migrate from local file storage (`/uploads`) to Amazon S3 for production deployments.
