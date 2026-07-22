# Joblio

<p align="center">
  <img src="./public/logo.svg" alt="Joblio Logo" width="120" />
</p>

<p align="center">
  <strong>A modern, self-hosted applicant tracking system (ATS) built for job seekers.</strong>
</p>

<p align="center">
  Track applications, interviews, recruiters, follow-ups and documents from a single dashboard.
</p>

<p align="center">
  <img alt="Astro" src="https://img.shields.io/badge/Astro-5-FF5D01?logo=astro">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql">
  <img alt="License" src="https://img.shields.io/github/license/your-username/joblio">
</p>

---

## 📖 About

Joblio is an open-source, self-hosted Applicant Tracking System designed to help developers and professionals organize their job search.

Instead of relying on spreadsheets, Joblio provides a clean dashboard to manage:

- 📄 Applications
- 🏢 Companies
- 👤 Recruiter contacts
- 📅 Interviews
- 🔔 Follow-ups
- 📎 Documents
- 📊 Statistics
- 📝 Activity timeline

Everything stays under your control.

---

## ✨ Features

### Dashboard

- Statistics
- Follow-up reminders
- Recent activity
- Application overview

### Applications

- Create, edit and archive applications
- Track application status
- Salary expectations
- Priority management
- Favorite applications
- Notes

### Companies

- Company directory
- Career pages
- Company notes
- Website & LinkedIn

### Contacts

- Recruiters
- Hiring managers
- Technical interviewers
- Contact history

### Interviews

- Schedule interviews
- Multiple interview rounds
- Notes
- Results

### Documents

- Resume
- Cover letter
- Portfolio
- Other attachments

### Search & Filters

- Status
- Company
- Source
- Priority
- Tags
- Date

---

## 🚀 Tech Stack

| Category           | Technology      |
| ------------------ | --------------- |
| Framework          | Astro 5         |
| UI                 | React           |
| Styling            | Tailwind CSS v4 |
| Components         | shadcn/ui       |
| Database           | PostgreSQL      |
| ORM                | Drizzle ORM     |
| Validation         | Zod             |
| Tables             | TanStack Table  |
| Data Fetching      | TanStack Query  |
| Icons              | Lucide          |
| Formatter / Linter | Biome           |

---

## 📂 Project Structure

```text
src
├── components
├── db
│   ├── client.ts
│   ├── relations.ts
│   ├── schema
│   └── migrations
├── features
│   ├── applications
│   ├── companies
│   ├── contacts
│   ├── interviews
│   └── dashboard
├── layouts
├── lib
├── pages
├── styles
└── types
```

---

## 🗄️ Database

Main entities:

- Applications
- Companies
- Contacts
- Interviews
- Documents
- Activities
- Tags

---

## 🛠️ Development

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file.

```env
DATABASE_URL=postgres://user:password@localhost:5432/joblio
```

### Generate migrations

```bash
npm run db:generate
```

### Run migrations

```bash
npm run db:migrate
```

### Start development server

```bash
npm run dev
```

---

## 📋 Roadmap

### MVP

- [ ] Dashboard
- [ ] Applications CRUD
- [ ] Companies
- [ ] Contacts
- [ ] Interviews
- [ ] Documents
- [ ] Search
- [ ] Filters

### Next

- [ ] Authentication
- [ ] Calendar
- [ ] Notifications
- [ ] Kanban view
- [ ] Email integration
- [ ] Import job offers
- [ ] AI-powered resume analysis
- [ ] Browser extension
- [ ] Mobile support

---

## 🤝 Contributing

Contributions are welcome!

If you'd like to improve Joblio:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

Please follow the project's coding conventions and keep pull requests focused.

---

## 📜 License

This project will be released under the **MIT License**.

---

## 💙 Acknowledgments

Joblio is inspired by modern developer tools and productivity applications such as:

- Linear
- GitHub
- Notion
- Vercel

while remaining fully open source and self-hosted.

---

<p align="center">
Made with ❤️ using Astro & PostgreSQL
</p>
