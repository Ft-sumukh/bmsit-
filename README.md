# 🧠 StudyMind — AI Study Copilot Platform

A full-stack, AI-powered study platform designed for engineering students.

Think of it as **ChatGPT + Notion + Quizlet** for engineering learning.

## 🎯 Project Goals

Students can:
- Upload PDFs and handwritten notes
- Ask AI questions from uploaded material
- Generate summaries, quizzes, flashcards, and viva questions
- Get simplified explanations of hard topics
- Track learning progress
- Generate personalized AI study plans

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router v6
- Axios
- TanStack Query
- Zustand
- React Hook Form + Zod
- Framer Motion
- React Dropzone
- React Toastify/Sonner
- Lucide React

### Backend
- Node.js + Express
- Multer
- PDF-parse / pdfjs-dist
- jsonwebtoken (JWT)
- bcryptjs
- dotenv
- cors
- express-validator
- Morgan

### Database
- MongoDB + Mongoose
- Pinecone / Weaviate / Qdrant (vector DB)
- Redis (optional, Phase 3)

### AI Layer
- OpenAI (`gpt-4o`, `text-embedding-3-small`)
- LangChain.js
- LangChain document loaders/text splitters/vector stores
- RetrievalQA / ConversationalRetrievalChain

### Storage / Auth / Deploy
- Local disk uploads in Phase 1, Cloudinary/S3 later
- JWT auth (access + refresh token pattern)
- Frontend on Vercel, backend on Render/Railway, DB on Atlas

## 📁 Target Project Structure

```text
studymind/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🔐 Security Requirements

- Password hashing with `bcrypt` (salt rounds: 12)
- Access JWT expiry: 15m
- Refresh JWT expiry: 7d
- Refresh token in HTTP-only cookie
- Protected routes via JWT middleware
- PDF-only upload validation, max 10MB
- Rate limiting on AI endpoints
- Secrets only through environment variables
- Strict CORS to frontend origin
- Input sanitization on all user inputs
- MongoDB injection protection via Mongoose

## 🌐 Core API Endpoints

- `/api/auth` → register, login, logout, me, refresh
- `/api/documents` → upload/list/get/delete docs
- `/api/chat` → document chat + history
- `/api/quiz` → generate/get/submit/delete quiz
- `/api/flashcards` → generate/get/update/delete deck
- `/api/summary` → generate/get summary
- `/api/studyplan` → generate/get study plan

## 🤖 AI Features

1. **RAG document chatbot** over uploaded notes
2. **Quiz generator** with scoring
3. **Flashcard generator** with mastery tracking
4. **Summary generator**
5. **Viva question generator** with model answers
6. **Topic simplifier** for difficult concepts
7. **Personalized AI study plan generator**

## 🎨 UI/UX Requirements

- Dark navy + indigo + cyan design system
- Mobile-first responsive UI
- Accessible controls (aria labels + keyboard support)
- Skeleton loaders, empty states, and retryable error states
- Pages: Landing, Auth, Dashboard, Upload, Chat, Quiz, Flashcards, Summary, Study Plan

## 🚀 Phased Development Plan

### Phase 1 (MVP)
- Project setup
- JWT auth
- PDF upload + extraction
- AI summary generation
- Basic AI chatbot
- Dashboard for uploaded documents
- Deployment

### Phase 2 (Smart Features)
- Pinecone integration
- Full RAG pipeline
- Quiz + flashcards + viva + topic simplifier
- Chat history persistence

### Phase 3 (Advanced)
- Study plan + calendar view
- Cloudinary storage
- Multi-document chat
- Progress charts
- OAuth login
- Streaming AI responses
- Voice input

### Phase 4 (Production)
- Payments + usage tiers
- Password reset/email verification
- Admin analytics
- OCR for handwritten notes
- YouTube summarizer
- Mind map generator
- PWA support

## 📊 Progress Metrics to Track

- Total documents uploaded
- Total study sessions
- Average quiz score
- Flashcards mastered vs pending
- Weekly study hours vs target
- Topics covered
- Study streak

## 🧪 Environment Variables

### Backend
```env
NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=studymind-docs
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## ✅ Success Criteria

This project is successful when:
1. A student can sign up and use it end-to-end without help.
2. It is actively useful for real exam preparation.
3. It is deployed and publicly accessible.
4. The architecture and implementation can be clearly explained in interviews.
