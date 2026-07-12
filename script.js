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

    let failedAttempts = 0;
    const maxAttempts = 5;
    let isRegisterMode = false;
    
    let testAccounts = [
        { email: 'manager@transitops.in', password: 'password123', role: 'Fleet Manager' },
        { email: 'dispatcher@transitops.in', password: 'password123', role: 'Dispatcher' },
        { email: 'safety@transitops.in', password: 'password123', role: 'Safety Officer' },
        { email: 'finance@transitops.in', password: 'password123', role: 'Financial Analyst' }
    ];

    toggleAuthMode.addEventListener('click', function(e) {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        errorMessage.style.display = 'none';
        
        if (isRegisterMode) {
            formTitle.innerText = "Create your account";
            formSubtitle.innerText = "Register your credentials into the platform database";
            btnSubmit.innerText = "Register & Save";
            toggleAuthMode.innerText = "Already have an account? Sign In";
            rememberRow.style.display = "none";
        } else {
            formTitle.innerText = "Sign in to your account";
            formSubtitle.innerText = "Enter your credentials to continue";
            btnSubmit.innerText = "Sign In";
            toggleAuthMode.innerText = "Are you a new user? Create an account";
            rememberRow.style.display = "flex";
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enteredEmail = document.getElementById('email').value.trim();
        const enteredPassword = document.getElementById('password').value;
        const selectedRole = document.getElementById('role').value;
        
        if (isRegisterMode) {
            const existingUser = testAccounts.find(account => account.email === enteredEmail);
            
            if (existingUser) {
                errorText.innerText = "✖ Account already exists.";
                lockWarning.innerText = "";
                errorMessage.style.display = 'block';
                return;
            }
            
            testAccounts.push({
                email: enteredEmail,
                password: enteredPassword,
                role: selectedRole
            });
            
            alert('Registration Successful! Switching to Login.');
            toggleAuthMode.click();
            return;
        }
        
        const matchedUser = testAccounts.find(function(account) {
            return account.email === enteredEmail && 
                   account.password === enteredPassword && 
                   account.role === selectedRole;
        });
        
        if (matchedUser) {
            errorMessage.style.display = 'none';
            failedAttempts = 0;
            
            const sessionData = {
                userEmail: matchedUser.email,
                userRole: matchedUser.role,
                isLoggedIn: true
            };
            
            localStorage.setItem('transitops_session', JSON.stringify(sessionData));
            alert('Login Successful! Welcome.');
            window.location.href = 'dashboard.html';
            
        } else {
            failedAttempts++;
            const remaining = maxAttempts - failedAttempts;
            errorMessage.style.display = 'block';
            
            if (failedAttempts >= maxAttempts) {
                errorText.innerText = "✖ Account locked due to 5 failed attempts.";
                lockWarning.innerText = "Please contact your system admin.";
                
                document.getElementById('email').disabled = true;
                document.getElementById('password').disabled = true;
                document.getElementById('role').disabled = true;
                btnSubmit.disabled = true;
            } else {
                errorText.innerText = "✖ Invalid credentials.";
                lockWarning.innerText = "Warning: " + remaining + " more attempts remaining.";
            }
        }
    });
});