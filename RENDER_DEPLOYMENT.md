# Render Deployment Steps

## For Client (Vite React) https://carvora-app.onrender.com/

1. **Update API URL in your code:**
   - In any component making API calls, use:
     ```javascript
     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
     ```

2. **In Render Dashboard:**
   - Create a new Static Site
   - Connect your GitHub repo
   - Fill in these details:
     - **Name:** `carvora-client`
     - **Root Directory:** `client`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`

3. **Environment Variables:**
   - `VITE_API_URL`: `https://carvora-api.onrender.com` (replace with your actual server URL)

4. **Deploy** and verify the site loads

## Troubleshooting

- **"No open ports detected"**: Usually means the app crashed during startup
  - Check Build Logs for errors
  - Make sure HF_TOKEN is set
  - Model download might be timing out

- **CORS errors**: Make sure FRONTEND_URL matches your client URL exactly

- **Model loading slow**: TensorFlow models take ~30s to load on first startup
  - The 120s timeout should handle this
  - Consider upgrading from free tier for faster restarts
