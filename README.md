# Foodoscope (EatInSync) Prototype

This is the MERN stack prototype for the Foodoscope application, designed to help users eat safely by analyzing dishes for allergens, intolerances, and taste compatibility.

## Features

-   **Dish Analysis**: Analyzes recipes using RecipeDB and FlavorDB APIs.
-   **Safety First**: Strictly blocks allergens, warns about intolerances, and checks for compound sensitivities (e.g., alcohol, fermentation).
-   **Taste Match**: Calculates a compatibility score based on your flavor preferences (Sweet, Spicy, Bitter, Sour, Umami).
-   **Alternatives**: Suggests safer recipe alternatives if a dish is blocked or has a low compatibility score.
-   **Reaction Logging**: Allows users to log how they felt after eating a dish to improve future recommendations.
-   **Profile Management**: Quick edits for allergies, intolerances, and taste preferences.

## Prerequisites

-   Node.js (v14+)
-   MongoDB (Local or Atlas)
-   Foodoscope API Key (RecipeDB / FlavorDB access)

## Setup

1.  **Clone the repository** (if applicable).
2.  **Install Dependencies**:
    ```bash
    # Server
    cd server
    npm install

    # Client
    cd ../client
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/foodoscope
    JWT_SECRET=your_jwt_secret_here
    FOODOSCOPE_API_KEY=your_api_key_here
    ```

## Running the Application

1.  **Start the Backend**:
    ```bash
    cd server
    npm run dev
    # Runs on http://localhost:5000
    ```

2.  **Start the Frontend**:
    ```bash
    cd client
    npm start
    # Runs on http://localhost:3000
    ```

## Testing

To verify the safety logic (BCS and Allergy Blocking):

```bash
cd server
npm test
```
(Note: You may need to install `jest` and `supertest` if not already installed: `npm install --save-dev jest supertest`)

## Project Structure

-   `server/services/foodoscope.js`: Handles API calls to RecipeDB/FlavorDB with caching and synonym mapping.
-   `server/services/compatibilityEngine.js`: Core logic for BCS (Biological Compatibility Score) and TasteMatch.
-   `server/seed/`: Contains `synonyms.json` and `swaps.json` for enhanced data accuracy.
-   `client/src/pages/Dashboard.jsx`: Safety-first UI for displaying analysis results.

## Troubleshooting

-   **"Profile not found"**: Ensure you visit `/onboarding` or `/profile` to create your initial profile.
-   **API Errors**: Check your `FOODOSCOPE_API_KEY` in `.env`. The system handles some API failures by returning neutral scores with warnings.

