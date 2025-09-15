# 🧑‍💻 AI-Interview

An **AI-powered mock interview platform** that simulates real technical interviews, evaluates candidate responses, and generates detailed feedback.  
This project was built as a proof-of-concept for the **AI-Powered Excel Mock Interviewer** assignment, but is extensible to other domains.

---

## 🚀 Problem Statement  

Manual technical interviews (e.g., Excel skills) are **time-consuming** and **inconsistent**, slowing down hiring pipelines.  
This platform automates the process by enabling an **AI interviewer** to:  
- Conduct structured, multi-turn interviews  
- Evaluate candidate answers in real-time  
- Generate a detailed feedback report  

---

## 🛠️ Tech Stack  

### **Backend**
- **Node.js + Express.js** → Authentication & APIs  
- **MongoDB** → User data & interview metadata  

### **Frontend**
- **Next.js (with TypeScript)** → Interactive web interface  
- **Tailwind CSS** → Styling  

### **AI & Feedback**
- **Vapi (GPT-4)** → Conversational AI interviewer  
- **Gemini API** → Feedback generation after the interview  
- **Firebase** → Stores feedback securely  

---

## 📂 Project Structure  

```
AI-Interview/
│
├── app/                  # Next.js app routes / pages
├── components/           # Reusable UI components
├── constants/            # Constants and static values
├── lib/                  # Helpers, actions, utilities
├── public/               # Static assets
├── server/               # Express.js backend (auth, API handling)
├── types/                # TypeScript type definitions
│
├── .env.local            # Environment variables
├── package.json          # Dependencies & scripts
├── next.config.ts        # Next.js config
├── tsconfig.json         # TypeScript config
└── README.md             # Documentation
```

---

## 🔑 Features  

- 🔐 **User Authentication** with MongoDB backend  
- 🗣️ **AI-Powered Interviewer** (Vapi GPT-4) simulates real interviews  
- ⚡ **Dynamic Question Flow** based on role, level, tech stack  
- 📝 **Feedback Generation** via Gemini API  
- ☁️ **Feedback Storage** in Firebase  
- 📊 **User Dashboard** to view past interviews & reports  

---

## ⚙️ Setup & Installation  

1. **Clone the repo**  
```bash
git clone https://github.com/AnmolVerma06/AI-Interview.git
cd AI-Interview
```

2. **Install dependencies**  
```bash
npm install
```

3. **Setup environment variables**  
Create `.env.local` (for Next.js) and `.env` (for backend) with the following:  

```bash
# MongoDB / Backend
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>

# Vapi (AI interviewer)
NEXT_PUBLIC_VAPI_WEB_TOKEN=<your_vapi_token>
NEXT_PUBLIC_VAPI_WORKFLOW_ID=<your_vapi_workflow_id>

# Gemini API (feedback)
GEMINI_API_KEY=<your_gemini_api_key>

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<your_firebase_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_project.firebaseapp.com>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_messaging_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your_app_id>
```

4. **Run the app**  
```bash
npm run dev
```
Frontend available at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Workflow  

1. User signs in (auth handled via **MongoDB + Express**).  
2. AI interviewer (**Vapi GPT-4**) conducts the mock interview.  
3. Candidate responses are evaluated during conversation.  
4. **Gemini API** generates structured feedback.  
5. Feedback is stored in **Firebase** for later review.  

---

## 📌 Future Improvements  

- 📊 Recruiter dashboards with analytics  
- 🎙️ Voice-based interviews  
- 📑 Exportable feedback reports (PDF / share link)  
- 🌐 Multi-domain interview templates  

---

## 👨‍💻 Author  

Built with ❤️ by **Anmol Verma**  

