# 📅 Total Resource Optimization System (TROS)

> An AI-powered academic timetable scheduling system that uses a **Genetic Algorithm** to automatically generate conflict-free timetables for universities — optimizing rooms, faculty, and time slots in seconds.

---

## 🚀 Live Demo

🔗 [View Live](https://your-deployment-url.com) <!-- Replace with your actual URL if deployed -->

---

## 📌 About

TROS is a full-stack web application built to solve the classic **University Timetable Scheduling Problem** — an NP-hard combinatorial optimization problem. Instead of manual scheduling, the system runs a **Genetic Algorithm** on a Supabase Edge Function to produce optimized timetables that respect hard and soft scheduling constraints.

---

## ✨ Features

- 🧬 **Genetic Algorithm Engine** — Elitism, tournament selection, crossover & adaptive mutation
- 🔬 **Consecutive Lab Scheduling** — Lab sessions are always paired into back-to-back slots
- ⚡ **Real-time Progress** — Live generation updates via Supabase Realtime
- 📋 **Version History** — Full snapshot rollback to any previous timetable version
- ⚠️ **Conflict Detection** — Automatic detection of room, faculty and batch clashes
- 👨‍🏫 **Faculty Preferences** — Soft constraint support for preferred teaching times
- 📊 **Workload Tracking** — Per-faculty load monitoring across the week
- 🔐 **Role-based Access** — Timetable generation restricted to admin users only

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime (WebSockets) |
| Algorithm | Genetic Algorithm (Deno/TypeScript) |
| State | TanStack Query (React Query) |

---

## 🧬 How the Genetic Algorithm Works

```
Initialize Population
        ↓
Evaluate Fitness (hard + soft constraints)
        ↓
Selection (Tournament)
        ↓
Crossover (uniform)
        ↓
Mutation (room, day, time slot)
        ↓
Elitism (keep best)
        ↓
Repeat until 0 violations or stagnation
```

### Constraints handled:

**Hard Constraints (violations heavily penalized)**
- No room double-booking
- No faculty teaching two classes simultaneously
- No batch scheduled in two rooms at once
- Room type must match (lab slots → lab rooms, lectures → classrooms)
- Room capacity must fit batch strength
- Faculty max hours per day / per week
- Lab pairs must be on the same day in consecutive time slots
- Faculty unavailability (preference = 0)

**Soft Constraints (rewarded in fitness score)**
- Faculty preferred time slots (preference = 2)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Supabase CLI

### 1. Clone the repository

```bash
git clone https://github.com/SalinaPradhan/Total-Resource-Optimization-System.git
cd Total-Resource-Optimization-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the SQL migrations in your Supabase SQL editor (found in `/supabase/migrations/`).

Make sure these tables exist:
- `schedules`, `schedule_entries`, `schedule_versions`
- `teaching_assignments`, `courses`, `batches`
- `rooms`, `time_slots`, `faculty`, `faculty_preferences`
- `generation_jobs`, `user_roles`

### 5. Deploy the Edge Function

```bash
supabase functions deploy generate-timetable
```

### 6. Run the development server

```bash
npm run dev
```

---

## 📁 Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks (useGenerateTimetable, etc.)
│   ├── integrations/      # Supabase client setup & generated types
│   └── pages/             # Page components (Scheduler, Dashboard, etc.)
├── supabase/
│   └── functions/
│       └── generate-timetable/
│           └── index.ts   # GA engine (Deno Edge Function)
└── public/
```

---

## 🔐 Roles & Permissions

| Action | Admin | Regular User |
|---|---|---|
| View timetable | ✅ | ✅ |
| Generate timetable | ✅ | ❌ |
| Manage faculty | ✅ | ❌ |
| View conflicts | ✅ | ✅ |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👩‍💻 Author

**Salina Pradhan**
- GitHub: [@SalinaPradhan](https://github.com/SalinaPradhan)

---

> ⭐ If you found this project useful, consider giving it a star!
