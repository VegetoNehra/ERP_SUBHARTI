# Subharti ERP – University Management System

A full-stack **Enterprise Resource Planning (ERP) system for university academic and administrative management**.

The project was developed during my internship at **Swami Vivekanand Subharti University** with the objective of understanding and solving the complexities involved in managing large-scale academic data, role-based administrative operations, faculty allocations, student records, marks, and result publishing.

The system focuses on building a structured, scalable, and permission-controlled academic management platform rather than a simple CRUD-based dashboard.

---

## Overview

University academic systems involve multiple interconnected entities such as colleges, departments, courses, branches, subjects, faculty members, students, academic sessions, and results.

Managing these entities independently creates data inconsistencies and makes academic workflows difficult to maintain.

**Subharti ERP** introduces a relational academic architecture where data flows through a structured hierarchy:

```text
University
   │
   ├── Colleges
   │      │
   │      └── Departments
   │              │
   │              └── Courses
   │                      │
   │                      ├── Branches
   │                      │
   │                      └── Subjects
   │
   ├── Faculty
   │      │
   │      └── Subject Allocations
   │
   └── Students
          │
          ├── Marks
          └── Results
```

The system provides dedicated dashboards and workflows for administrators, faculty members, and students.

---

## Key Features

### Role-Based Authentication

The ERP uses JWT-based authentication and protected API routes.

Supported user roles include:

* Master Administrator
* Administrator / Faculty
* Student

Frontend routes and backend APIs are protected based on authenticated user information.

---

### Dynamic Permission Management

Instead of relying only on fixed roles, the ERP implements a **menu and API-level permission system**.

The system uses:

* `menu_master`
* `admin_permissions`

The Master Administrator can dynamically assign administrative permissions to faculty or administrative users.

Examples of configurable permissions include:

* Manage Students
* Register Students
* Manage Faculty
* Register Faculty
* Manage Colleges
* Manage Departments
* Manage Courses
* Manage Subjects
* Faculty Subject Allocation
* Manage Results
* Manage Permissions

Navigation items are dynamically displayed based on the permissions assigned to the authenticated user.

The backend independently validates permissions before executing protected operations.

---

## Academic Management System

The academic module maintains a structured relationship between university entities.

### Colleges

Manage colleges operating under the university.

Administrators can:

* Create colleges
* View colleges
* Update college information
* Delete colleges

---

### Departments

Departments are linked to their respective colleges.

```text
College → Department
```

The system supports filtered department retrieval using college identifiers.

---

### Courses

Courses are associated with departments.

```text
College → Department → Course
```

Each course contains information such as:

* Course code
* Course name
* Total semesters
* Department association

---

### Branches

Branches or specializations are linked to courses.

```text
Course → Branch
```

This allows the system to support programs containing multiple academic specializations.

---

### Subjects

Subjects are mapped to courses and semesters.

Each subject contains:

* Subject code
* Subject name
* Course
* Semester

This structure allows subject data to be dynamically retrieved during faculty allocation and result management.

---

## Faculty Management

The faculty management module allows administrators to manage university faculty records.

Features include:

* Faculty registration
* Faculty profile management
* Department mapping
* Course association
* Branch association
* Administrative permission assignment

Faculty records are stored separately from general authentication information to maintain proper data normalization.

---

## Faculty Subject Allocation

One of the major modules of the ERP is the **Faculty Subject Allocation System**.

Faculty members can be assigned to specific academic classes using multiple parameters.

An allocation contains:

```text
Faculty
   │
   ├── College
   ├── Department
   ├── Course
   ├── Semester
   ├── Section
   ├── Subject
   └── Academic Year
```

This allows the system to determine exactly which faculty member is responsible for a particular subject and class.

The allocation system supports:

* Viewing faculty allocations
* Fetching available subjects
* Creating subject allocations
* Removing allocations
* Academic year mapping
* Semester-based allocation
* Section-based allocation

Faculty allocations are later used by the marks management system to automatically determine accessible classes.

---

## Student Management

The student management module handles student academic records.

Administrators can:

* Register students
* View student records
* Manage student information
* Associate students with academic programs
* Map students to semesters and sections

Student academic information is used dynamically when faculty members access their allocated classes.

---

## Marks Management System

Faculty members can enter marks only for classes and subjects allocated to them.

The workflow is based on faculty subject allocations.

```text
Faculty Login
      │
      ▼
Fetch Faculty Allocations
      │
      ▼
Select Class / Subject
      │
      ▼
Fetch Students
      │
      ▼
Enter Marks
      │
      ▼
Save / Update Marks
```

The `marks` table stores the **latest working state of student marks**.

Faculty members can update marks until the academic data is finalized.

The system prevents faculty members from accessing classes that are not allocated to them.

---

## Result Management Architecture

The result module was designed to separate **working marks data** from **published academic results**.

Three major tables are used:

```text
marks
student_results
result_details
```

### `marks`

Stores the latest marks entered or updated by faculty members.

This acts as the active academic marks workspace.

```text
Faculty Updates Marks
        │
        ▼
marks
```

---

### `student_results`

Stores the summarized semester result of a student.

It contains calculated academic information such as:

* Semester
* Total marks
* Obtained marks
* SGPA
* Result status
* Publication status

---

### `result_details`

Stores subject-wise details of a generated result.

When results are generated, the latest marks are copied into the result system.

```text
marks
   │
   ▼
Generate Result
   │
   ├── student_results
   │
   └── result_details
```

This architecture ensures that published results remain historically consistent even if faculty members later modify marks.

In simple terms:

```text
marks = Latest Working Data

result_details = Generated Result Snapshot

student_results = Semester Result Summary
```

---

## Result Generation Workflow

The result generation process follows the workflow:

```text
Faculty Enters Marks
        │
        ▼
Marks Stored
        │
        ▼
Admin Generates Results
        │
        ▼
Calculate Grades and SGPA
        │
        ▼
Create Student Result
        │
        ▼
Store Subject Result Details
        │
        ▼
Admin Publishes Result
        │
        ▼
Student Can View Result
```

The grading logic follows an AKTU-inspired grading structure.

Students can access semester-wise results from their dashboard after publication.

---

## Dashboards

### Admin Dashboard

The administrative dashboard provides access to:

* Dashboard statistics
* Notice management
* Student management
* Faculty management
* Academic management
* Faculty allocation
* Permission management
* Result management

Available menu options are dynamically filtered based on user permissions.

---

### Faculty Workflow

Faculty members can:

* View allocated classes
* Select subjects
* View students belonging to a class
* Enter marks
* Update marks
* Finalize academic marks

Faculty access is controlled using subject allocations.

---

### Student Dashboard

Students can access academic information including:

* Student profile
* Academic information
* Semester results
* SGPA
* Subject-wise result details
* Notices

Only published results are visible to students.

---

## Notice Management

Administrators can create and manage university notices.

The notice system supports:

* Creating notices
* Viewing notices
* Editing notices
* Deleting notices

Notices can be displayed on dashboard interfaces for academic communication.

---

## Technology Stack

### Frontend

* React.js
* JavaScript
* Tailwind CSS
* React Router
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* JWT Authentication
* REST APIs

### Database

* PostgreSQL

### Development Tools

* Git
* GitHub
* VS Code
* pgAdmin
* Postman

---

## System Architecture

```text
React Frontend
      │
      │ REST API
      ▼
Express.js Backend
      │
      ├── Authentication Middleware
      ├── Permission Validation
      ├── Controllers
      └── API Routes
      │
      ▼
PostgreSQL Database
```

The frontend communicates with the Express backend through REST APIs.

Protected endpoints use JWT authentication middleware.

Administrative operations additionally pass through permission validation before controller execution.

---

## Project Structure

```text
subharti-erp/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── auth/
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── backend/
│   │
│   ├── controllers/
│   │   ├── academicController.js
│   │   ├── facultyAllocationController.js
│   │   ├── resultController.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── academicRoutes.js
│   │   ├── facultyAllocationRoutes.js
│   │   ├── resultRoutes.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── utils/
│   │   └── permissions.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   └── server.js
│
└── README.md
```

> The exact project structure may change as additional ERP modules are developed.

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd subharti-erp
```

---

### 2. Backend Setup

Navigate to the backend directory.

```bash
cd backend
npm install
```

Create a `.env` file.

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server.

```bash
npm run dev
```

or:

```bash
npm start
```

---

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory.

```bash
cd frontend
npm install
```

Start the React development server.

```bash
npm run dev
```

The frontend development server will display the local application URL in the terminal.

---

## Database Setup

The project uses PostgreSQL.

Create a PostgreSQL database and configure the connection using the `DATABASE_URL` environment variable.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/subharti_erp
```

The database architecture includes major tables such as:

```text
users
faculty_profile
student_profile
colleges
departments
courses
branches
subjects
faculty_subject_allocation
menu_master
admin_permissions
notices
marks
student_results
result_details
```

Ensure all required database tables, foreign keys, and constraints are configured before starting the backend server.

---

## API Modules

The backend is organized into separate API modules.

### Academic APIs

Responsible for:

* Colleges
* Departments
* Courses
* Branches
* Subjects

### Faculty Allocation APIs

Responsible for:

* Faculty retrieval
* Available subjects
* Faculty allocations
* Allocation creation
* Allocation deletion

### Result APIs

Faculty operations:

```text
GET    /faculty/classes
GET    /faculty/class/:allocationId/students
POST   /faculty/save-marks
PUT    /faculty/lock/:allocationId
```

Administrative operations:

```text
GET    /admin
POST   /admin/generate
PUT    /admin/publish
```

Student operations:

```text
GET    /student
GET    /student/:semester
```

Actual API prefixes depend on the route configuration used in the backend server.

---

## Major Development Challenges

### Designing the Academic Hierarchy

One of the major challenges was representing the university's academic structure without duplicating data.

The solution was to create a normalized relational hierarchy:

```text
College
   ↓
Department
   ↓
Course
   ↓
Branch / Subject
```

This allowed academic data to be dynamically filtered and reused throughout the ERP.

---

### Dynamic Administrative Permissions

A fixed role system was insufficient because different administrators may require different levels of access.

A menu-based permission system was implemented where permissions are stored in the database.

Both the frontend and backend validate these permissions.

This prevents users from accessing unauthorized modules even if an API endpoint is manually requested.

---

### Faculty and Subject Mapping

Faculty members may teach different subjects across semesters, sections, courses, and academic years.

A dedicated `faculty_subject_allocation` system was created to represent these relationships.

This allocation system later became the foundation of the marks management workflow.

---

### Maintaining Result History

Directly displaying data from the marks table could cause previously published results to change when faculty updated marks.

To solve this, the system separates:

```text
Working Marks
      ↓
Generated Result Snapshot
      ↓
Published Result
```

The `result_details` table stores the generated subject-wise result snapshot.

This preserves academic result history.

---

### Managing Complex Relational Queries

Several ERP pages require information from multiple database entities.

For example, faculty allocation information may require data from:

```text
faculty_profile
colleges
departments
courses
subjects
faculty_subject_allocation
```

PostgreSQL joins and structured API responses were used to convert relational data into frontend-friendly objects.

---

## Current Development Status

Implemented modules include:

* Authentication System
* Protected Routes
* Master Administrator Role
* Dynamic Permission Management
* College Management
* Department Management
* Course Management
* Branch Management
* Subject Management
* Faculty Management
* Student Management
* Faculty Subject Allocation
* Notice Management
* Marks Entry System
* Result Generation Architecture
* Result Publishing Workflow
* Student Result Dashboard

The project continues to evolve as additional university management workflows are explored.

---

## Future Improvements

Potential future improvements include:

* Attendance Management
* Academic Calendar
* Examination Scheduling
* Fee Management
* Student Document Management
* Faculty Attendance
* Timetable Generation
* Notification System
* Result Analytics
* CGPA Calculation
* Transcript Generation
* Audit Logs
* Advanced Reporting Dashboard
* Cloud Deployment
* Automated Database Migration System

---

## Learning Outcomes

Developing this ERP provided practical experience in:

* Designing relational database architectures
* PostgreSQL schema normalization
* Complex SQL joins
* REST API development
* JWT authentication
* Role-based access control
* Dynamic permission systems
* React dashboard architecture
* State management
* Academic workflow modelling
* Result generation algorithms
* Full-stack debugging
* Designing scalable backend modules

The project significantly improved my understanding of how real-world enterprise applications manage complex relationships and business workflows.

---

## Author

**Vishwajeet Nehra**

Computer Science Student | Full-Stack Developer | Aspiring AI Developer

Focused on building scalable full-stack applications and exploring artificial intelligence and modern software architecture.

---

## Acknowledgement

I would like to express my gratitude to **Swami Vivekanand Subharti University** for providing me with the internship opportunity and practical exposure to real-world software development.

I am also thankful to the **Deputy Technical Officer (DTO)** for the guidance and technical mentorship provided throughout the development process.

The internship helped me strengthen my development skills and gain practical experience in designing and developing a complex ERP application.

---

## Disclaimer

This project was developed as part of a learning and internship experience.

It is not presented as the official production ERP system of Swami Vivekanand Subharti University unless explicitly authorized by the institution.

University names and references are used to describe the project's development context.

---

## License

This project is intended for educational and portfolio purposes.

Please contact the repository owner before using the project for commercial or institutional deployment.

---

⭐ If you find this project interesting, consider starring the repository.
