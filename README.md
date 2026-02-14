# EatInSync - Molecular Biological Compatibility Engine

Welcome to the EatInSync MVP! This project consists of a React frontend and a FastAPI backend designed to predict biological compatibility of meals.

## 🚀 Quick Start (Frontend Only - Demo Mode)

The frontend is pre-configured with a **Simulation Mode** that demonstrates the core value proposition without requiring the backend server or API keys.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies (if not already done):**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to `http://localhost:5173` (or the URL shown in the terminal).

### 🧪 Try the Demo
-   Go to **Analyze Meal**.
-   Enter **"Aged Cheese Platter"** or **"Red Wine Risotto"**.
-   Observe the **Biological Compatibility Score** drop and triggers appear.
-   Enter **"Grilled Salmon"** to see a **Safe** result.

---

## ⚙️ Backend Setup (Optional for Full Stack)

If you wish to run the full stack with the Python backend:

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Activate Virtual Environment:**
    ```bash
    venv\Scripts\activate
    ```

3.  **Install Requirements:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

5.  **Connect Frontend:**
    Update `src/pages/Analysis.jsx` to replace the simulation logic with an `axios.post` call to `http://localhost:8000/api/v1/analyze_dish`.

## 🎨 Design System

-   **Colors:** Sync Emerald (`#10b981`), Molecular Blue (`#0f172a`), Clean Slate (`#f8fafc`).
-   **Typography:** Inter (Google Fonts).
-   **Framework:** React + Tailwind CSS (v3).

## 🛠 Tech Stack

-   **Frontend:** React (Vite), Tailwind CSS, Framer Motion
-   **Backend:** FastAPI, Python
-   **Data:** RecipeDB (Mocked), FlavorDB (Mocked)
