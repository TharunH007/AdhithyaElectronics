# Railway Deployment Guide

This guide will help you deploy the Bombay Dyeing - NKM Trading Company application on Railway.

## Prerequisites

- Railway account (https://railway.app)
- Git repository with your code
- MongoDB URI (if not using Railway's MongoDB plugin)
- Environment variables configured

## Deployment Steps

### 1. Create a Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub" or "Deploy from Git"
4. Connect your repository

### 2. Add Environment Variables

Railway automatically detects the `railway.json` file for configuration. However, you need to set sensitive environment variables in the Railway dashboard:

1. Go to your project settings
2. Click "Variables" tab
3. Add the following environment variables:

```
NODE_ENV=production
PORT=8000 (Railway assigns dynamically, or leave empty for auto)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secure-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Bombay Dyeing - NKM Trading Company <noreply@nkmtrading.com>
FRONTEND_URL=https://your-railway-domain.up.railway.app
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
```

### 3. Configure Database (Optional)

If you don't have a MongoDB Atlas account:

1. Add a service to Railway
2. Select "MongoDB" from the plugin marketplace
3. Railway will provide the connection URI

### 4. Deploy

Once variables are set:

1. Railway automatically deploys on push to your main branch
2. Or click "Deploy" button in the dashboard
3. Monitor deployment in the "Deployments" tab

### 5. Verify Deployment

- Check the logs in Railway dashboard
- Visit your app URL
- Test API endpoints

## Architecture

The application runs as a single Node.js service that serves:
- Backend API at `/api/*`
- Frontend static assets (production build)

The backend:
- Listens on the PORT environment variable (Railway assigns this)
- Uses MongoDB for data storage
- Serves the frontend build from `../frontend/dist`

## Important Notes

- **CORS**: The backend is configured to allow requests from your Railway app URL
- **File Uploads**: Cloudinary is used for image storage (not local file system)
- **Port**: Railway assigns the port dynamically. The app uses `process.env.PORT` which defaults to 5000
- **Environment**: Must be set to `production` for proper behavior
- **Database**: Ensure MongoDB URI is correct and accessible from Railway servers

## Post-Deployment

1. Update `FRONTEND_URL` with your actual Railway app URL
2. Test all features including:
   - User authentication
   - Product browsing
   - Cart functionality
   - Payments (use Razorpay test keys)
   - Email verification

## Troubleshooting

**Application crashes on startup:**
- Check logs for MongoDB connection errors
- Verify environment variables are set correctly
- Ensure MongoDB server is running and accessible

**CORS errors:**
- Update `FRONTEND_URL` in environment variables
- Clear browser cache

**File upload issues:**
- Verify Cloudinary credentials
- Check image file sizes (limit is 50MB)

## Rollback

To rollback to a previous version:
1. Go to "Deployments" tab
2. Find the previous working deployment
3. Click "Redeploy"

## Local Development

For local development:
```bash
# Terminal 1: Backend
cd backend
npm install
npm run server

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.
