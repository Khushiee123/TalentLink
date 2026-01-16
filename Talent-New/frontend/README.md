# TalentLink | Professional Freelance Marketplace

TalentLink is a high-end, full-stack marketplace platform built to connect elite freelancers with clients. The platform manages the entire professional lifecycle—from initial project discovery and bidding to contract execution and reputation building.

---
**Name** : Khushi Soni
**Batch no.**: 1


## 🚀 Project Roadmap & Progress (Weeks 1-6)

### 📍 Milestone 1: Foundation & Backend Setup (Week 1 & 2)
**Focus:** Infrastructure, Database Design, and Authentication.
* **Role Definition:** Established distinct logic for **Client** and **Freelancer** roles.
* **Schema Engineering:** Designed a relational database covering Users, Profiles, Projects, Proposals, Contracts, Messages, Reviews, and Skills.
* **API Security:** Initialized Django REST Framework (DRF) with **JWT (JSON Web Tokens)** for secure, stateless authentication.
* **Frontend Bootstrap:** Created the React application skeleton and integrated the authentication flow (Login/Register).

**Technical Outcomes:**
* Mastery of role-based access control and JWT flows.
* Relational schema design for complex marketplace interactions.



---

### 📍 Milestone 2: Profiles, Projects & Proposals (Week 3 & 4)
**Focus:** Core Marketplace Objects and Discovery.
* **Profile Engine:** Implemented a detailed Profile model (Portfolios, Skills, Hourly Rates, and Availability).
* **Project Management:** Built full CRUD endpoints for project postings, allowing clients to manage their listings.
* **Discovery Tools:** Developed search and filtering APIs to browse projects by skill, budget, and duration.
* **Bidding System:** Launched the Proposal model, enabling freelancers to submit bids and clients to manage applications via the React UI.

**Technical Outcomes:**
* Implementation of advanced search/filter logic.
* Connecting complex frontend forms to backend APIs using Axios.

---

### 📍 Milestone 3: Contracts & Engagement (Week 5 & 6)
**Focus:** Transactional Lifecycle and UI Refinement.
* **Contract Flow:** Engineered the transactional logic to convert accepted proposals into formal **Contracts**, tracking project status through completion.
* **Reputation System:** Built a post-project feedback loop allowing for verified Reviews and Star Ratings.
* **Notification Engine:** Developed an in-app notification system to alert users of status updates and new messages.
* **Bento UI Dashboard:** Redesigned the Profile Tab with a modern "Bento-grid" layout, featuring animated performance metrics like **Project Volume** and **Success Rates**.
* **Professional Network:** Created a dynamic directory to display unique collaboration history between users.

**Technical Outcomes:**
* Implementation of end-to-end project lifecycles (Posting → Proposal → Contract → Review).
* Real-time data visualization and modern CSS animations for professional records.



---

## 🛠️ Technical Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js (Hooks, Context API) |
| **Backend** | Django REST Framework (Python) |
| **Database** | PostgreSQL (Production), SQLite (Local) |
| **Auth** | JWT (SimpleJWT) |
| **Styling** | Modern CSS3 (Bento Grid, Animations) |
| **API Client** | Axios |

---

## ⚙️ Local Development Setup

### 1. Backend Configuration (Django)
```bash
# Navigate to backend folder
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver