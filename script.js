document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const lockWarning = document.getElementById('lock-warning');
    const btnSubmit = document.getElementById('btn-submit');
    const toggleAuthMode = document.getElementById('toggle-auth-mode');
    
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const rememberRow = document.getElementById('remember-row');

    // Track login failures locally in this session
    let failedAttempts = 0;
    const maxAttempts = 5; // [cite 121]
    
    // Flag to manage whether we are looking at Login or Register mode
    let isRegisterMode = false;
    
    // Core Seed Accounts Array [cite: 121, 122]
    let testAccounts = [
        { email: 'manager@transitops.in', password: 'password123', role: 'Fleet Manager' },
        { email: 'dispatcher@transitops.in', password: 'password123', role: 'Dispatcher' },
        { email: 'safety@transitops.in', password: 'password123', role: 'Safety Officer' },
        { email: 'finance@transitops.in', password: 'password123', role: 'Financial Analyst' }
    ];

    // Toggle Mode Logic (Login vs Register Switcher)
    toggleAuthMode.addEventListener('click', function(e) {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        
        // Reset warnings when switching views
        errorMessage.style.display = 'none';
        
        if (isRegisterMode) {
            formTitle.innerText = "Create your account";
            formSubtitle.innerText = "Register your credentials into the platform database";
            btnSubmit.innerText = "Register & Save";
            toggleAuthMode.innerText = "Already have an account? Sign In";
            rememberRow.style.display = "none"; // Hide remember me row on sign up
        } else {
            formTitle.innerText = "Sign in to your account";
            formSubtitle.innerText = "Enter your credentials to continue";
            btnSubmit.innerText = "Sign In";
            toggleAuthMode.innerText = "Are you a new user? Create an account";
            rememberRow.style.display = "flex";
        }
    });

    // Form Submission Processing
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enteredEmail = document.getElementById('email').value.trim();
        const enteredPassword = document.getElementById('password').value;
        const selectedRole = document.getElementById('role').value;
        
        // --- MODE 1: REGISTER NEW USER ---
        if (isRegisterMode) {
            // Check if user already exists
            const existingUser = testAccounts.find(account => account.email === enteredEmail);
            
            if (existingUser) {
                errorText.innerText = "✖ Account already exists with this email.";
                lockWarning.innerText = "";
                errorMessage.style.display = 'block';
                return;
            }
            
            // Append new registration object directly to our active array list
            testAccounts.push({
                email: enteredEmail,
                password: enteredPassword,
                role: selectedRole
            });
            
            alert('Registration Successful! Account created for ' + selectedRole + '. Switching to Login.');
            toggleAuthMode.click(); // Programmatically click to switch back to login mode
            return;
        }
        
        // --- MODE 2: SIGN IN HANDLING ---
        const matchedUser = testAccounts.find(function(account) {
            return account.email === enteredEmail && 
                   account.password === enteredPassword && 
                   account.role === selectedRole;
        });
        
        if (matchedUser) {
            errorMessage.style.display = 'none';
            failedAttempts = 0; // Reset counter on success
            
            const sessionData = {
                userEmail: matchedUser.email,
                userRole: matchedUser.role,
                isLoggedIn: true
            };
            
            localStorage.setItem('transitops_session', JSON.stringify(sessionData));
            alert('Login Successful! Welcome to the ' + matchedUser.role + ' Panel.');
            window.location.href = 'dashboard.html';
            
        } else {
            // Increment failed entry attempts counter
            failedAttempts++;
            const remaining = maxAttempts - failedAttempts;
            
            errorMessage.style.display = 'block';
            
            if (failedAttempts >= maxAttempts) {
                // Lock down state 
                errorText.innerText = "✖ Account locked due to 5 failed attempts.";
                lockWarning.innerText = " Please contact your system admin.";
                
                // Disable all form field operations 
                document.getElementById('email').disabled = true;
                document.getElementById('password').disabled = true;
                document.getElementById('role').disabled = true;
                btnSubmit.disabled = true;
            } else {
                // Show dynamic countdown warning
                errorText.innerText = "✖ Invalid credentials.";
                lockWarning.innerText = " Warning: " + remaining + " more attempts remaining before account lock.";
            }
        }
    });
});