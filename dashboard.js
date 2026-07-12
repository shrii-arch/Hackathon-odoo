document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Verify Authentication Status & Read Role Parameters
    const rawSession = localStorage.getItem('transitops_session');
    
    if (!rawSession) {
        alert('Access Denied. Please authenticate first.');
        window.location.href = 'index.html';
        return;
    }
    
    const contextUserData = JSON.parse(rawSession);
    
    // 2. Safely Update UI Elements Based on Session Data
    document.getElementById('profile-name').innerText = contextUserData.userEmail.split('@')[0];
    document.getElementById('profile-role').innerText = contextUserData.userRole;
    
    // 3. Setup Interactive Filter Updates
    const typeFilterSelector = document.getElementById('filter-type');
    const statusFilterSelector = document.getElementById('filter-status');
    
    function applyWorkspaceFilters() {
        console.log(`Filtering system state by Type: ${typeFilterSelector.value} | Status: ${statusFilterSelector.value}`);
        // This is ready to run data manipulations once backend state arrays are connected!
    }
    
    typeFilterSelector.addEventListener('change', applyWorkspaceFilters);
    statusFilterSelector.addEventListener('change', applyWorkspaceFilters);
});