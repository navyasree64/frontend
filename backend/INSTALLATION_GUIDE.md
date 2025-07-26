# YAICESS Solutions - Quick Installation Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Download XAMPP
1. Go to [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Download XAMPP for your operating system
3. Install and start Apache + MySQL services

### Step 2: Deploy Backend
1. Copy the `backend/` folder to your XAMPP directory:
   - **Windows**: `C:\xampp\htdocs\yaicess-backend\`
   - **Mac/Linux**: `/opt/lampp/htdocs/yaicess-backend/`

### Step 3: Run Installation
1. Open browser
2. Go to: `http://localhost/yaicess-backend/install/setup.php`
3. Wait for "Installation Completed Successfully!" message

### Step 4: Test Everything
1. **Test Registration**: `http://localhost/yaicess-backend/tests/test_registration.php`
2. **Test Admin**: `http://localhost/yaicess-backend/tests/test_admin.php`
3. Both should show "All tests passed!"

## 🎯 Default Credentials
- **Admin Username**: `admin`
- **Admin Password**: `admin123`
- **Database**: `event_registration`

## ✅ Verification Checklist
- [ ] XAMPP running (Apache + MySQL green lights)
- [ ] Installation script completed successfully
- [ ] Both test scripts show 100% pass rate
- [ ] Can access: `http://localhost/yaicess-backend/api/get_stats.php`

## 🔧 If Something Goes Wrong

### Database Connection Error
```bash
# Check if MySQL is running in XAMPP control panel
# Default credentials should work: root / (empty password)
```

### Permission Errors
```bash
# Windows: Run XAMPP as Administrator
# Mac/Linux: Check folder permissions
chmod -R 755 /opt/lampp/htdocs/yaicess-backend/
```

### Port Conflicts
```bash
# Apache default port: 80
# MySQL default port: 3306
# Change in XAMPP config if ports are taken
```

## 🎉 You're Ready!
Your backend is now running and ready to handle:
- ✅ User registrations
- ✅ Admin login/logout
- ✅ Data management
- ✅ CSV exports
- ✅ Real-time statistics

Connect your frontend HTML forms to these API endpoints:
- `POST /backend/api/register.php` - Registration
- `POST /backend/api/admin_login.php` - Admin login
- `GET /backend/api/get_registrations.php` - Get all registrations

Need help? Check the full `README.md` for detailed documentation!