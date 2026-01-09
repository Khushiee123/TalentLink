# Talent-Link: Freelance Marketplace (Batch-1 Internship)
**Name:** Khushi Soni  
**Batch:** 1  
**Branch:** `Khushi_Soni-Batch-1`

## 📌 Project Overview
Talent-Link is a professional full-stack platform designed to bridge the gap between skilled freelancers and global clients. Built using **Django REST Framework** and **React.js**, the project focuses on a secure, scalable architecture for project bidding, contract management, and real-time collaboration.

---

## 📅 Milestone Progress Tracker

### ✅ Milestone 1: Requirements, DB Design & Backend Setup (Week 1 & 2)
*Focus: Infrastructure and Authentication*
- **Role-Based Scope:** Defined distinct permissions and flows for **Clients** and **Freelancers**.
- **Relational Schema Design:** Architected a robust database including `Users`, `Profiles`, `Projects`, `Proposals`, `Contracts`, `Messages`, `Reviews`, and `Skills`.
- **Backend Foundation:** Initialized Django with DRF, configuring **PostgreSQL** for production and **SQLite** for local development.
- **Security Layer:** Implemented stateless authentication using **JWT (JSON Web Tokens)**.
- **Frontend Skeleton:** Developed the React bootstrap with integrated Login/Register pages and protected route logic.

### ✅ Milestone 2: Profiles, Projects & Proposals (Week 3 & 4)
*Focus: Core Marketplace Engine*
- **Dynamic Profiles:** Developed an extensible Profile model featuring portfolio links, skill tags, hourly rates, and availability status.
- **Project CRUD:** Built REST endpoints allowing Clients to Create, Read, Update, and Delete project postings.
- **Discovery Logic:** Engineered search and filtering APIs to sort projects by technical skills, budget, and duration.
- **Bidding Engine:** Launched the Proposal system enabling freelancers to submit bids and clients to manage them through a streamlined React UI.

### ✅ Milestone 3: Contracts & Messaging (Week 5 )
*Focus: Professional Collaboration & UI Refinement*
- **Contract Workflow:** Developed logic to transition accepted proposals into active contracts, tracking status from "Active" to "Completed."
- **Advanced Messaging UI:** - Designed a modern SaaS chat interface with asymmetric bubbles and a "Floating Pill" input footer.
    - Implemented **Polling** logic to ensure real-time data synchronization between users without requiring manual refreshes.
    - Resolved critical UI bugs including message/timestamp overlap and responsive word-wrap logic.
- **Integrated Dashboard:** Connected the Top-Header profile trigger to a centralized **Profile Tab**, featuring performance metrics (Completion Rate, Win Rate) via a Bento-grid layout.

---

## 🛠️ Technical Stack
* **Frontend:** React.js (Hooks, Context API, Axios)
* **Backend:** Django REST Framework (DRF)
* **Database:** PostgreSQL (Production) / SQLite (Development)
* **Authentication:** JWT (JSON Web Tokens)
* **UI/UX:** Custom Modern CSS (Flexbox, Grid, Box-Shadow Depth)

---

## 🎯 Technical Outcomes & Learnings
- **JWT Flow:** Mastered the implementation of secure tokens for persistent user sessions.
- **Relational Integrity:** Successfully mapped complex marketplace interactions (Project -> Proposal -> Contract -> Message) within the database.
- **State Optimization:** Managed synchronized React states for real-time UI updates during messaging.
- **Modern UI Standards:** Applied professional design principles like asymmetric radii and responsive layouts for a high-end SaaS feel.