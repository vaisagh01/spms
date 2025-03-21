# Student Portfolio Management System

This is a **Student Portfolio Management System** built using **Next.js** for the frontend and **Django** for the backend. It allows students to manage their curricular, co-curricular, and extracurricular activities while enabling faculty to monitor and assess student progress.

## Features
- **Student Management**: Manage student profiles, enrollments, and academic records.
- **Attendance Tracking**: Mark and view student attendance.
- **Internship & Project Tracking**: Add, approve, and manage student internships and projects.
- **Club & Event Management**: Create and manage student clubs and events.
- **Results Management**: View semester results and analytics.

---
## Tech Stack
- **Frontend**: Next.js (React), ShadCN UI, Tailwind CSS
- **Backend**: Django, Django REST Framework (DRF)
- **Database**: SQLite
- **Authentication**: Django Authentication
- **Charts & Graphs**: Recharts

---
## Getting Started

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (LTS version) & npm
- **Python 3.x** & pip
- **SQLite** (built-in with Python)

---
## Backend Setup (Django)

### 1. Clone the Repository
```sh
git clone https://github.com/yourusername/student-portfolio-management.git
cd student-portfolio-management/backend
```

### 2. Create a Virtual Environment
```sh
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies
```sh
pip install -r requirements.txt
```

### 4. Apply Migrations & Setup Database
```sh
python manage.py migrate
python manage.py makemigrations
```

### 5. Create a Superuser (Admin Access)
```sh
python manage.py createsuperuser
```
Follow the prompts to set up your admin credentials.

### 6. Run the Development Server
```sh
python manage.py runserver
```
The API will be accessible at: `http://127.0.0.1:8000/`

### 7. Populate Sample Data (Optional)
```sh
python manage.py loaddata sample_data.json
```

---
## Frontend Setup (Next.js)

### 1. Navigate to the Frontend Directory
```sh
cd ../frontend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the `frontend` folder and set the API URL:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 4. Run the Development Server
```sh
npm run dev
```
The app will be accessible at: `http://localhost:3000/`

---
## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration

### Students
- `GET /api/students/` - List all students
- `POST /api/students/add/` - Add a new student

### Attendance
- `POST /api/attendance/mark/` - Mark attendance
- `GET /api/attendance/student/{id}/` - Get student attendance

### Results
- `GET /api/curricular/student/{id}/results/` - Get student results

### Internships
- `POST /api/internships/add/` - Add an internship
- `GET /api/internships/` - Get student internships

### Projects
- `POST /api/projects/add/` - Add a project
- `GET /api/projects/` - Get student projects

---
## Deployment
### Backend Deployment (Django)
- Use **Gunicorn** & **NGINX** for production.
- Deploy on **Heroku, DigitalOcean, or AWS EC2**.
- Use **SQLite for local**, and **PostgreSQL/MySQL** for production.

### Frontend Deployment (Next.js)
- Deploy using **Vercel or Netlify**.
- Ensure **NEXT_PUBLIC_API_URL** points to the production backend.

---
## License
This project is licensed under the MIT License.

---
## Contributors
- **Your Name** - [GitHub](https://github.com/yourusername)

---
## Screenshots
Add screenshots of your application here.

