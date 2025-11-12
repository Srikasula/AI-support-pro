# 🤖 AI-Support Pro

AI-Support Pro is a **full-stack Next.js 14** project that simulates a modern **customer support system** powered by **AI-assisted replies**.

---

## 🚀 Purpose

The purpose of this project is to demonstrate how AI can help customer service agents respond faster and more accurately by automatically drafting message replies based on previous ticket history.

---

## 🧱 Features

- 🎟️ View customer tickets  
- 💬 See conversation history per ticket  
- 🤖 “Draft with AI” button generates smart reply suggestions  
- ⚙️ Built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**  
- 🧩 Mock REST APIs for tickets and AI draft replies  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React (Next.js App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Backend | Next.js API Routes |
| Tools | Node.js, npm |

---

## 🗂️ Folder Structure

app/
├── api/
│ ├── tickets/
│ │ ├── route.ts
│ │ └── [id]/messages/route.ts
│ └── ai/draft-reply/route.ts
├── tickets/
│ ├── page.tsx
│ └── [id]/page.tsx
├── layout.tsx
└── globals.css
components/
├── Section.tsx
└── Pill.tsx


## 🧩 How to Run Locally

```bash
# 1. Clone this repository
git clone https://github.com/Srikasula/AI-support-pro.git
cd AI-support-pro

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
