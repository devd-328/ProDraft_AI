<p align="center">
  <img src="https://img.icons8.com/fluency/96/sparkles.png" alt="ProDraft AI Logo" width="80" height="80"/>
</p>

<h1 align="center">ProDraft AI</h1>

<p align="center">
  <strong>✨ Transform rough drafts into polished, professional content with AI</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
</p>

---

## 🎯 What is ProDraft AI?

ProDraft AI is a **free, AI-powered content polishing tool** that transforms your rough drafts into professional, ready-to-use content. Whether you're writing emails, social media posts, reports, or summaries — ProDraft AI refines your text while preserving your unique voice.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Multiple Formats** | Polish content for emails, social media, reports, or summaries |
| 🤖 **Gemini AI Powered** | Leverages Google's Gemini 2.0 Flash for intelligent content enhancement |
| 📱 **Responsive Design** | Beautiful, minimalist UI that works on any device |
| 🔐 **Secure Auth** | Email/password and Google OAuth authentication via Supabase |
| 📊 **Usage Dashboard** | Track your content polishing history and statistics |
| 📥 **Export Options** | Download polished content as TXT or PDF |
| ⚡ **Rate Limiting** | Built-in protection against API abuse |
| 🆓 **100% Free** | No premium tiers, no credit card required |

---

## 🚀 Demo

Try the live demo on our landing page — **one free polish** before signing up!

### How It Works

```
1️⃣  Paste your rough draft
2️⃣  Select your output format (email, social, report, summary)
3️⃣  Click "Polish" and watch the magic happen
4️⃣  Copy or export your polished content
```

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
      <br>Next.js 16
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br>React 19
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br>Tailwind 4
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=supabase" width="48" height="48" alt="Supabase" />
      <br>Supabase
    </td>
    <td align="center" width="96">
      <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="48" height="48" alt="Gemini" />
      <br>Gemini AI
    </td>
  </tr>
</table>

### Additional Libraries

- **Radix UI** — Accessible UI primitives
- **react-hook-form** — Performant form handling
- **jsPDF** — Client-side PDF generation
- **Lucide React** — Beautiful icons

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/devd-328/ProDraft_AI.git

# Navigate to project directory
cd ProDraft_AI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Setting Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Enable Email/Password authentication
3. (Optional) Enable Google OAuth provider
4. Create the usage tracking table:

```sql
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  format TEXT NOT NULL,
  input_length INTEGER NOT NULL,
  output_length INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own usage
CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own usage
CREATE POLICY "Users can insert own usage" ON usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Getting Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

---

## 📁 Project Structure

```
ProDraft-AI/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js      # Gemini AI API endpoint
│   ├── app/
│   │   └── page.jsx          # Main polishing tool
│   ├── dashboard/
│   │   └── page.jsx          # User dashboard
│   ├── login/
│   │   └── page.jsx          # Auth page
│   ├── globals.css           # Global styles
│   ├── layout.jsx            # Root layout
│   └── page.jsx              # Landing page
├── lib/
│   ├── supabase.js           # Supabase client & auth helpers
│   ├── rateLimit.js          # Rate limiting utility
│   └── export.js             # TXT/PDF export functions
├── public/                   # Static assets
└── ...config files
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💖 Acknowledgments

- [Google Gemini](https://deepmind.google/technologies/gemini/) for the powerful AI capabilities
- [Supabase](https://supabase.com) for authentication and database
- [Vercel](https://vercel.com) for seamless deployment
- [Radix UI](https://www.radix-ui.com/) for accessible components

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/devd-328">devd-328</a>
</p>

<p align="center">
  <a href="https://github.com/devd-328/ProDraft_AI/stargazers">⭐ Star this repo if you found it helpful!</a>
</p>
