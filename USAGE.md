# Aditya Electronics - Usage & Deployment Guide

## 1. Environment Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- Razorpay Account (Key ID & Secret)
- Cloudinary Account (Cloud Name, API Key, Secret)

### Environment Variables
Create a `.env` file in the `backend/` directory with the following:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_strong_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## 2. Local Development

1. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Seed Data** (Optional):
   ```bash
   cd backend
   npm run data:import
   ```
   *Default Admin*: admin@example.com / password123

3. **Run Development Servers**:
   - Backend: `cd backend && npm run server` (runs on port 5000)
   - Frontend: `cd frontend && npm run dev` (runs on port 5173)

   The frontend proxies API requests to `http://localhost:5000`.

## 3. Production Deployment

This project uses a **Monolithic Deployment** strategy. The React frontend is built into static files and served by the Express backend.

### Deployment Steps

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   This creates a `dist` folder in `frontend/`.

2. **Deploy Backend**:
   - Upload the entire `aditya-electronics` folder to your server (e.g., DigitalOcean, Heroku, Render, AWS EC2).
   - Ensure `backend/` and `frontend/dist/` are present.
   - Install backend dependencies: `cd backend && npm install --production`.

3. **Start Server**:
   ```bash
   cd backend
   npm start
   ```
   The application will be available at `http://your-server-ip:5000`.

### Hosting Recommendations
- **Render / Railway**: Connect your GitHub repo. Set Root Directory to `backend`. Add a Build Command that installs backend deps AND builds frontend: `cd ../frontend && npm install && npm run build && cd ../backend && npm install`. Start Command: `node index.js`.
- **VPS (DigitalOcean)**: Use PM2 to keep `node index.js` running.

## 4. Troubleshooting
- **Images not loading**: Check Cloudinary credentials.
- **Payment failed**: Check Razorpay keys and ensure you are in Test Mode (differentiated by key prefix `rzp_test_`).
- **White screen**: Open Console (F12). Check if API calls fail.
