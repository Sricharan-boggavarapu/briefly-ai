Briefly AI – AI Text Summarizer & Resume Analyzer

Briefly AI is a modern AI-powered web application that helps users quickly summarize long text and analyze resumes with AI feedback.

The platform leverages large language models to transform large information into concise insights and actionable suggestions.

🌐 Live Demo:

https://briefly-ai-lyart.vercel.app

📂 GitHub Repository:

https://github.com/Sricharan-boggavarapu/briefly-ai
✨ Features
🧠 AI Text Summarization

Convert long text into short, meaningful summaries

Maintains key context

Prevents hallucinated information using structured prompts

📄 Resume Analyzer

Upload a resume and receive AI feedback including:

Resume Score (0–100)

Strengths

Weaknesses

Suggestions for improvement

ATS-style evaluation

⚡ Interactive UI

Dark theme modern interface

Instant AI responses

Copy summary button

Download summary as text

Resume upload support

🛠 Tech Stack
Technology	Purpose
Next.js	Full-stack framework
React	UI development
Groq API	AI model inference
Tailwind CSS	UI styling
Vercel	Deployment
GitHub	Version control
🧠 How It Works
Text Summarization Flow
User Input Text
      ↓
Frontend (Next.js UI)
      ↓
API Route
      ↓
Groq AI Model
      ↓
Generated Summary
      ↓
Displayed to User
Resume Analysis Flow
Resume Upload
      ↓
Text Extraction
      ↓
Send Resume Text to AI
      ↓
AI Evaluation
      ↓
Score + Feedback
📸 Screenshots
Text Summarizer

(Add screenshot here)

Resume Analyzer

(Add screenshot here)

⚙️ Installation & Setup

Clone the repository:

git clone https://github.com/Sricharan-boggavarapu/briefly-ai.git

Move into the project folder:

cd briefly-ai

Install dependencies:

npm install
🔑 Environment Variables

Create a .env.local file in the root directory.

Add your Groq API key:

GROQ_API_KEY=your_groq_api_key_here
▶️ Run the Project

Start the development server:

npm run dev

Open the browser:

http://localhost:3000
🚀 Deployment

This project is deployed using Vercel.

Steps:

Push project to GitHub

Import repository in Vercel

Add environment variable

Deploy

Live project:

https://briefly-ai-lyart.vercel.app
🧪 Example Output
Text Summary

Input:

Artificial intelligence is transforming industries by enabling machines to learn from data and automate tasks.

Output:

Artificial intelligence is transforming industries by enabling machines to learn from data and automate tasks efficiently.
Resume Analysis
Resume Score: 78/100

Strengths
• Good technical project descriptions
• Strong programming skills

Weaknesses
• Lack of quantified achievements

Suggestions
• Add measurable results
• Improve bullet formatting
🔍 Challenges Faced

During development several challenges were encountered:

PDF parsing compatibility with Node environments

AI hallucination in summaries

Handling malformed PDF text encoding

Optimizing prompts for reliable AI evaluation

Solutions included:

Prompt engineering

Safe decoding logic

Simplified text extraction pipeline

📈 Future Improvements

ATS keyword matching

Resume formatting suggestions

Multi-language summarization

Authentication & user accounts

Document summarization (PDF, DOCX)

👨‍💻 Author

Sricharan Boggavarapu

GitHub:

https://github.com/Sricharan-boggavarapu
⭐ Support

If you found this project useful, consider giving it a star on GitHub ⭐.

📌 Project Highlights

✔ AI Integration
✔ Full-Stack Development
✔ Real-World AI Application
✔ Deployed Web App
✔ Resume-Ready Portfolio Project
