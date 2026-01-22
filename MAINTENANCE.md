# Maintenance Checklist - Aditya Electronics

## Weekly/Bi-Weekly
- [ ] **Check Order Statuses**: Ensure no orders are stuck in "Pending" for too long (might indicate payment webhook failure or dropped connection).
- [ ] **Inventory Check**: Verify if physical stock matches `countInStock` in Admin Dashboard.
- [ ] **Database Backup**: If using MongoDB Atlas, ensure auto-backups are active. If local, run `mongodump` periodically.

## Monthly
- [ ] **Security Updates**: Run `npm audit` in `backend/` and `frontend/` to check for vulnerability in dependencies.
- [ ] **Logs Review**: Check server logs (if stored) for recurring errors (500s).
- [ ] **Image Storage**: Check Cloudinary usage quota.

## Common Issues & Fixes
- **"Token Failed"**: JWT expires in 30 days. Users just need to log in again.
- **Payment Verification Failed**: Often due to clock skew or mismatched secrets. Ensure Server Time is synced (NTP).
- **Frontend changes not showing**: Did you run `npm run build` in `frontend/` after making changes? The backend serves the *built* files in production.

## Emergency Restart
If the server hangs:
1. Log in to server.
2. Find process: `ps aux | grep node`
3. Kill: `kill -9 <PID>`
4. Restart: `npm start` (or `pm2 restart all`)
