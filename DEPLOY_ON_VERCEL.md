# How to Deploy Synoptic AI on Vercel

Since this project is now hosted on GitHub at `https://github.com/Aryan717317/Synoptic-AI`, deployment is seamless using Vercel's Git Integration.

## Step-by-Step Instructions

1.  **Log in to Vercel**: Go to [vercel.com](https://vercel.com) and log in.
2.  **Add New Project**: Click on **"Add New..."** > **"Project"**.
3.  **Import Repository**: 
    - You should see `Aryan717317/Synoptic-AI` in the list of "Import Git Repository".
    - Click **"Import"**.

4.  **Configure Project (CRITICAL)**:
    - **Project Name**: You can leave it as `synoptic-ai` or change it.
    - **Framework Preset**: Vercel should auto-detect **Vite**. If not, select **Vite**.
    - **Root Directory**: 
        - Click **"Edit"** next to Root Directory.
        - Select the folder **`ui_revamp`**.
        - This is important because the frontend code lives in this subfolder.
    - **Build & Output Settings**: Leave as default (`vite build` / `dist`).
    - **Environment Variables**:
        - Since the current dashboard uses simulated data for demonstration, no API keys are required for the initial deployment.
        - If you connect the backend later, you will add `GOOGLE_AI_API_KEY` here.

5.  **Deploy**:
    - Click **"Deploy"**.
    - Vercel will build the React application.
    - Within a minute, you should see the **"Congratulations!"** screen.

6.  **Visit Your Dashboard**:
    - Click the preview image or the domain link (e.g., `synoptic-ai.vercel.app`) to see your live, futuristic AI Orchestrator Dashboard.

## Troubleshooting

- **404 Error on Load**: Ensure you selected `ui_revamp` as the Root Directory. If you deployed the root, Vercel won't find the index.html.
- **Build Fails**: Check the capabilities of the Vercel build instance. Standard settings work for this Vite + Tailwind setup.
