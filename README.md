# Team OS Dashboard

A modern, responsive dashboard for EdTech startups built with Next.js 14, TypeScript, Tailwind CSS, and Recharts.

![Team OS Dashboard](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## 🚀 Features

- **📊 Dashboard Home** - Budget metrics, active tasks, and launch countdown
- **📦 Inventory System** - Equipment tracking with status badges and budget monitoring
- **✅ Task Manager** - Kanban board with team filtering and priority indicators
- **📅 Timeline** - Project roadmap with milestone tracking
- **💰 Budget Calculator** - Expense visualization and break-even analysis

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
team-os-dashboard/
├── app/              # Next.js pages with App Router
│   ├── page.tsx      # Dashboard home
│   ├── inventory/    # Equipment tracking
│   ├── tasks/        # Kanban board
│   ├── timeline/     # Project roadmap
│   └── budget/       # Financial overview
├── components/       # Reusable UI components
├── lib/
│   └── store.ts      # Central data store (edit this!)
└── package.json
```

## 🎨 Customizing Data

All data is stored in **`lib/store.ts`** with clear TypeScript interfaces and comments.

### Edit Equipment

```typescript
export const equipment: Equipment[] = [
  {
    id: "1",
    name: "Sony FX30 Camera",
    category: "Camera",
    price: 1799,
    status: "Received", // "To Buy" | "Ordered" | "Received"
    owner: "Ahmed Hassan",
  },
  // Add more items...
];
```

### Edit Tasks

```typescript
export const tasks: Task[] = [
  {
    id: "1",
    title: "Record Lesson 6",
    description: "Record the advanced functions module",
    status: "To Do", // "To Do" | "In Progress" | "Done"
    assignee: "1", // Team member ID
    priority: "High", // "High" | "Medium" | "Low"
  },
];
```

### Edit Budget

```typescript
export const budget: Budget = {
  totalBudget: 15000,
  oneTimeCosts: [
    { category: "Cameras & Lenses", amount: 2537 },
    // Add more categories...
  ],
  monthlyCosts: [
    { category: "Electricity", amount: 150 },
    // Add more costs...
  ],
  revenuePerStudent: 49.99, // Monthly subscription price
};
```

## 📱 Responsive Design

- **Desktop (≥1024px)**: Fixed sidebar navigation
- **Tablet/Mobile (<1024px)**: Bottom navigation bar
- All components are fully responsive

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Utilities**: clsx, tailwind-merge

## 📦 Included Sample Data

The dashboard comes pre-populated with realistic EdTech studio data:

- **Equipment**: Sony FX30, Sigma lenses, Rode microphones, Aputure lighting, Montage PC
- **Tasks**: Recording lessons, editing videos, marketing activities
- **Team Members**: Content creator, editor, marketer, operations manager
- **Budget**: $15,000 total with detailed breakdown
- **Timeline**: 3 project phases from studio setup to launch

## 🎨 Design System

- **Primary Color**: Emerald/Teal (#10b981)
- **Font**: Inter (Google Fonts)
- **Card Style**: White with subtle shadows and rounded corners
- **Badges**: Color-coded by status (Gray/Yellow/Green for inventory, Red/Yellow/Green for priority)

## 📊 Pages Overview

### Dashboard (/)
- Budget spent vs. remaining
- Active tasks counter
- Days until launch
- Quick action buttons
- Project status progress bars

### Inventory (/inventory)
- Equipment table with filtering
- Budget usage tracking
- Status badges (To Buy, Ordered, Received)
- Price summaries

### Tasks (/tasks)
- Kanban board (To Do, In Progress, Done)
- Team member filtering
- Priority indicators
- Avatar badges

### Timeline (/timeline)
- Vertical milestone view
- Current phase highlighting
- Completion status icons
- Date ranges

### Budget (/budget)
- One-time vs. monthly costs
- Interactive pie chart
- Break-even calculator
- Revenue projections

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Other Platforms

```bash
npm run build
npm start
```

## 📝 License

This project was created for educational purposes.

---

**Built with ❤️ for EdTech startups**
