# Game24 Project

This is a full-stack web application for playing the Game of 24. The backend is built with Django and Django REST Framework, and the frontend is a single-page application built with Angular.

## Features

- **Backend**: Django API for solving Game of 24 puzzles.
- **Frontend**: Angular UI for interacting with the game.
- **Code Quality**: Pre-commit hooks for formatting (Black, Prettier) and linting.
- **Testing**: Unit tests for both Django and Angular.

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.10+ and `pip`
- Node.js (LTS version recommended) and `npm`

## Development Setup

Follow these steps to set up your local development environment.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd game24-project
```

### 2. Backend Setup (Django)

```bash
# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt -r requirements-dev.txt
```

### 3. Frontend Setup (Angular)

```bash
# Navigate to the Angular app directory
cd game24_app

# Install Node.js dependencies
npm install

# Navigate back to the project root
cd ..
```

### 4. Install Pre-commit Hooks

This step is recommended to ensure your code adheres to the project's style guidelines.

```bash
pre-commit install
```

## Running the Application

You need to run two servers concurrently in separate terminals.

**Terminal 1: Start Django Backend**
```bash
# From the project root, with virtualenv activated
python manage.py runserver
```
The backend API will be available at `http://127.0.0.1:8000/`.

**Terminal 2: Start Angular Frontend**
```bash
# From the game24_app directory
cd game24_app
npm start
```
The frontend will be available at `http://localhost:4200/`.

## Running Tests

You can run tests for both the backend and frontend.

### Django Tests
```bash
# From the project root, with virtualenv activated
python manage.py test
```

### Angular Tests
```bash
# From the game24_app directory
npm test
```
