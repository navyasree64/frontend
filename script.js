// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
    });
    
    // Countdown Timer
    const countdown = () => {
        const countDate = new Date('July 21, 2025 00:00:00').getTime();
        const now = new Date().getTime();
        const gap = countDate - now;
        
        // Time calculations
        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;
        
        // Calculate the remaining time
        const textDay = Math.floor(gap / day);
        const textHour = Math.floor((gap % day) / hour);
        const textMinute = Math.floor((gap % hour) / minute);
        const textSecond = Math.floor((gap % minute) / second);
        
        // Update the HTML
        document.querySelector('#days').innerText = textDay < 10 ? '0' + textDay : textDay;
        document.querySelector('#hours').innerText = textHour < 10 ? '0' + textHour : textHour;
        document.querySelector('#minutes').innerText = textMinute < 10 ? '0' + textMinute : textMinute;
        document.querySelector('#seconds').innerText = textSecond < 10 ? '0' + textSecond : textSecond;
    };
    
    // Run countdown every second
    setInterval(countdown, 1000);
    
    // Schedule Tab Switching
    const scheduleTabs = document.querySelectorAll('.schedule-tabs .tab-btn');
    const scheduleContents = document.querySelectorAll('.schedule-content .tab-content');
    
    if (scheduleTabs.length > 0) {
        scheduleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-day');
                
                scheduleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                scheduleContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === target) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
    
    // Admin/User Tab Switching
    const adminTabs = document.querySelectorAll('.admin-tabs .tab-btn, .user-tabs .tab-btn');
    const adminContents = document.querySelectorAll('.admin-content .tab-content, .user-content .tab-content');
    
    if (adminTabs.length > 0) {
        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                
                adminTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                adminContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === target) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
    
    // DataTable Initialization for Admin Dashboard
    if (document.getElementById('registrationsTable')) {
        $('#registrationsTable').DataTable({
            responsive: true,
            "order": [[0, "desc"]]
        });
    }
    
    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
       loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
        
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const userType = document.getElementById('userType').value;
        
            if (!email || !password || !userType) {
                alert('Please fill in all fields');
                return;
            }
        
        // Get stored user data
            const userData = JSON.parse(localStorage.getItem(email));
        
        // Check if user exists and password matches
            if (userData && userData.password === password && userData.userType === userType) {
            // Store session info
                sessionStorage.setItem('loggedInUser', email);
                sessionStorage.setItem('userType', userType);
            
            // Redirect based on user type
                if (userType === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            } else {
                alert('Invalid email, password, or user type');
            }
        });
    }
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
        
        // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const sessionChoice = document.getElementById('sessionChoice').value;
            const agree = document.getElementById('agree').checked;
        
        // Create a random password for demo purposes
            const password = Math.random().toString(36).slice(-8);
        
                if (!fullName || !email || !phone || !sessionChoice || !agree) {
                    alert('Please fill in all required fields and agree to the terms');
                    return;
                }
        
        // Store user data with password
            const userData = {
                fullName: fullName,
                email: email,
                phone: phone,
                organization: document.getElementById('organization').value,
                sessionChoice: sessionChoice,
                dietary: document.getElementById('dietary').value,
                notes: document.getElementById('notes').value,
                userType: 'user' // Default to attendee
            };
        
        // Store in localStorage
            localStorage.setItem(email, JSON.stringify(userData));
        
        // Show the generated password to user (in real app, you would email it)
            alert(`Registration successful! Your password is: ${password}\nPlease save this for login.`);
            window.location.href = 'success.html';
        });
    }
    
    
    
    // Populate success page with registration data
    if (window.location.pathname.includes('success.html')) {
        const registrationData = JSON.parse(localStorage.getItem('registrationData'));
        
        if (registrationData) {
            document.getElementById('reg-name').textContent = registrationData.fullName;
            document.getElementById('reg-email').textContent = registrationData.email;
            document.getElementById('reg-session').textContent = registrationData.sessionChoice;
        }
    }
    
    // Highlight current year in footer
    document.querySelector('.footer-bottom').innerHTML = `&copy; ${new Date().getFullYear()} YAICESS Solutions. All rights reserved.`;
});