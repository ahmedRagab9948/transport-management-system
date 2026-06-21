# UI Design System
## Transport Management System (TMS)

---

# Design Philosophy

The application should look:
- Enterprise-grade
- Clean
- Professional
- Modern
- Data-focused
- Fast and responsive

The UI should prioritize:
- Readability
- Operational efficiency
- Easy navigation
- Clear data hierarchy

Inspired by:
- ERP systems
- Logistics dashboards
- Fleet management systems
- SaaS admin dashboards

---

# Tech Stack

Frontend Framework:
- Next.js
- TypeScript

Styling:
- Tailwind CSS

UI Components:
- shadcn/ui

Icons:
- lucide-react

Charts:
- recharts

Tables:
- TanStack Table

Forms:
- React Hook Form
- Zod Validation

State Management:
- Zustand

API Fetching:
- TanStack Query

---

# Layout Structure

Main Layout consists of:

- Sidebar
- Top Navbar
- Main Content Area
- Notification Panel (future)
- Global Search (future)

---

# Sidebar Design

Sidebar should:
- Be collapsible
- Support icons
- Support nested menus
- Highlight active route

Sidebar sections:

- Dashboard
- Trips
- Vehicles
- Drivers
- Clients
- Contracts
- Reports
- Users
- Settings

---

# Navbar Design

Navbar includes:
- Search input
- Notifications
- User profile dropdown
- Theme toggle
- Current page title

---

# Theme

Support:
- Light Mode
- Dark Mode

Default:
- Dark modern enterprise style

---

# Color Palette

Primary:
- Slate / Zinc / Neutral

Accent:
- Blue

Success:
- Green

Danger:
- Red

Warning:
- Orange

Background:
- Dark Gray / Off White

---

# Typography

Font:
- Inter

Headings:
- Bold
- Clear hierarchy

Body:
- Medium readability

Tables:
- Compact but readable

---

# Cards Design

Dashboard cards should display:
- Total Trips
- Active Vehicles
- Available Drivers
- Revenue
- Pending Trips

Card Style:
- Rounded corners
- Soft shadows
- Minimal borders
- Small trend indicators

---

# Tables Design

Tables are a core part of the system.

Requirements:
- Pagination
- Sorting
- Column filtering
- Global search
- Row actions
- Export support

Tables should support:
- Sticky headers
- Responsive overflow
- Loading skeletons

---

# Form Design

Forms should:
- Use modal or dedicated pages
- Have validation messages
- Show loading states
- Prevent duplicate submissions

---

# Status System

Status badges should have consistent colors.

Trip Status:
- Pending → Gray
- Assigned → Blue
- In Progress → Orange
- Completed → Green
- Cancelled → Red

Vehicle Status:
- Available
- Busy
- Maintenance
- Out of Service

Driver Status:
- Available
- On Trip
- Off Duty

---

# Dashboard Widgets

Dashboard should include:
- KPI Cards
- Trips Overview Chart
- Vehicle Status Chart
- Recent Activities
- Recent Trips Table

---

# Charts

Use:
- Line charts
- Bar charts
- Pie charts

Charts should:
- Be minimal
- Have tooltips
- Support dark mode

---

# Notifications

Future support:
- Toast notifications
- In-app notifications
- Alerts for:
  - License expiry
  - Maintenance
  - Cancelled trips

---

# UX Rules

The system should:
- Minimize clicks
- Avoid unnecessary pages
- Use confirmations before destructive actions
- Support keyboard navigation

---

# Loading Experience

Use:
- Skeleton loaders
- Smooth transitions
- Lazy loading where appropriate

Avoid:
- Spinners for full-page loading

---

# Empty States

Every empty table/page should include:
- Illustration
- Helpful text
- CTA button

Example:
"No trips found"
"Create your first trip"

---

# Mobile Responsiveness

System should support:
- Tablets
- Mobile devices

Sidebar should convert into:
- Drawer menu

Tables should:
- Scroll horizontally

---

# Accessibility

Support:
- Keyboard navigation
- Proper contrast
- Screen-reader labels

---

# Folder Structure Recommendation

/components
  /ui
  /layout
  /dashboard
  /trips
  /vehicles
  /drivers
  /shared

---

# UI Naming Conventions

Component Names:
- PascalCase

Examples:
- TripTable
- DriverCard
- VehicleStatusBadge

File Names:
- kebab-case

Examples:
- trip-table.tsx
- driver-form.tsx

---

# Reusable Components

Important reusable components:
- DataTable
- StatusBadge
- ConfirmDialog
- PageHeader
- SearchFilterBar
- EmptyState
- LoadingSkeleton

---

# Future Features

Planned future UI features:
- Real-time updates
- Live vehicle tracking
- Interactive maps
- Analytics dashboard
- AI assistant
- Calendar scheduling

---

# Design Goal

The system should feel like:
- A real enterprise SaaS product
- Fast
- Reliable
- Operationally efficient
- Easy for employees to use daily