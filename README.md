# Talent-Link: Freelance Marketplace (Batch-1 Internship)
Name : Khushi Soni
, Batch : 1

## 📌 Project Overview
Talent-Link is a full-stack platform designed to connect skilled freelancers with clients. This repository tracks the progress of the Batch-1 internship, focusing on building a scalable MERN/Django-based architecture to manage job postings, proposals, and secure user interactions.

---

## 📅 Internship Progress: Week 1 & 2 Checklist

### Phase 1: Planning & Architecture
- [x] **Define Scope & User Roles:**
    - **Client:** Can post projects, review proposals, and manage contracts.
    - **Freelancer:** Can create professional profiles, showcase skills, and bid on projects.
- [x] **Database Schema Design:**
    - Designed relational/document schemas including: `Users`, `Profiles`, `Projects`, `Proposals`, `Contracts`, `Messages`, `Reviews`, and `Skills`.

### Phase 2: Backend Development (Foundation)
- [x] **Environment Setup:** Initialized the backend using Django & Django REST Framework (DRF).
- [x] **Database Configuration:**
    - **Local:** SQLite for rapid development.
    - **Production Ready:** PostgreSQL integration.
- [x] **Authentication & Security:** - Implemented REST endpoints for **Registration** and **Login**.
    - Secured routes using **JWT (JSON Web Tokens)** for stateless authentication.
- [x] **User Management:** Developed CRUD operations for User Profiles.

### Phase 3: Frontend Development (Skeleton)
- [x] **React Initialization:** Set up the React.js frontend skeleton.
- [x] **Auth UI:** Created functional Login and Registration pages.
- [x] **Auth Flow Integration:** Connected the frontend to backend JWT endpoints to manage user sessions.

## Internship Progress: Week 3 & 4 (Advanced Features & UI Overhaul)

### Phase 4: Extended Backend Logic & Marketplace Engine
* **Dynamic Profile Architecture:** Developed a comprehensive Profile model that extends the user entity to include professional portfolios, skill sets, hourly rates, and real-time availability status.
* **Full Project CRUD Implementation:** Engineered secure REST endpoints allowing Clients to Create, Read, Update, and Delete project postings, ensuring full control over the project lifecycle.
* **Advanced Search & Filtering:** Implemented backend query logic to allow users to filter the project marketplace by technical skills, budget ranges, and project duration.
* **Proposal & Bidding System:**
    * Designed a Proposal model to facilitate the interaction between freelancers and clients.
    * Developed endpoints for proposal submission and a management interface for clients to review bids.

### Phase 5: Frontend Refactoring & UI/UX Optimization
* **Dashboard Modernization:** Refactored the layout by removing the static side panel in favor of a clean, sticky **Top Navigation Bar**, maximizing the workspace for data-heavy views.
* **UI Component Enhancement:** Updated the "Project Cards" with a modern aesthetic, utilizing refined shadows, improved typography, and clear action buttons for "Edit" and "Delete" operations.
* **Interactive Profile Hub:** Built a centralized Profile page with custom avatar upload capabilities and persistent local storage for a personalized user experience.
* **Responsive State Management:** Optimized React hooks (`useEffect`, `useState`) to ensure seamless data synchronization between the Django API and the modernized UI.

## 🛠️ Updated Tech Stack
* **Frontend:** React.js (Hooks, Context), Modern CSS (Flexbox/Grid)
* **Backend:** Django REST Framework (DRF)
* **Authentication:** JWT (JSON Web Tokens)
* **Database:** SQLite (Development) / PostgreSQL (Production)


