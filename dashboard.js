document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. SESSION INITIALIZATION ENGINE
    // ==========================================
    const rawSession = localStorage.getItem('transitops_session');
    if (!rawSession) {
        window.location.href = 'index.html';
        return;
    }
    const contextUserData = JSON.parse(rawSession);
    const profileNameEl = document.getElementById('profile-name');
    const profileRoleEl = document.getElementById('profile-role');
    
    if (profileNameEl && profileRoleEl) {
        profileNameEl.innerText = contextUserData.userEmail.split('@')[0].toUpperCase();
        profileRoleEl.innerText = contextUserData.userRole;
    }

    // ==========================================
    // 2. UNIFIED TAB NAVIGATION SYSTEM
    // ==========================================
    const menuItems = document.querySelectorAll('.menu-item');
    const viewSections = document.querySelectorAll('.view-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            if (!targetId) return;

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            viewSections.forEach(section => {
                section.style.display = (section.id === targetId) ? "block" : "none";
            });
        });
    });

    // ==========================================
    // 3. VEHICLE FLEET LEDGER HANDLERS
    // ==========================================
    const vehicleForm = document.getElementById('vehicle-form');
    const vehicleListBody = document.getElementById('vehicle-list-body');

    let fleetDatabase = JSON.parse(localStorage.getItem('transitops_fleet')) || [
        { id: "MAHINDRA VAN-05", reg: "WB-02-A-1111", type: "Van", fuel: "Diesel", capacity: 800, seats: 2, odometer: 15200, cost: 850000, status: "Available" },
        { id: "TATA ULTRA 12", reg: "WB-02-B-2222", type: "Truck", fuel: "Diesel", capacity: 3500, seats: 3, odometer: 42100, cost: 2100000, status: "On Trip" }
    ];

    function renderFleetTable() {
        if (!vehicleListBody) return;
        vehicleListBody.innerHTML = "";
        fleetDatabase.forEach(function(vehicle, index) {
            const rowHTML = `
                <tr>
                    <td><strong>${vehicle.id}</strong></td>
                    <td><code>${vehicle.reg}</code></td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.fuel}</td>
                    <td>${vehicle.capacity}kg / ${vehicle.seats}S</td>
                    <td>${vehicle.odometer} km</td>
                    <td>₹${vehicle.cost ? vehicle.cost.toLocaleString() : '0'}</td>
                    <td><span class="badge ${getStatusClass(vehicle.status)}">${vehicle.status}</span></td>
                    <td><button class="btn-delete-row delete-vehicle" data-index="${index}">Remove</button></td>
                </tr>
            `;
            vehicleListBody.innerHTML += rowHTML;
        });
        localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
    }

    if (vehicleForm) {
        vehicleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputReg = document.getElementById('v-reg').value.trim().toUpperCase();
            if (fleetDatabase.find(v => v.reg === inputReg)) {
                alert("Conflict: Duplicate Registration Number.");
                return;
            }
            fleetDatabase.push({
                id: document.getElementById('v-name').value.trim().toUpperCase(),
                reg: inputReg,
                type: document.getElementById('v-type').value,
                fuel: document.getElementById('v-fuel').value,
                capacity: parseInt(document.getElementById('v-capacity').value),
                seats: parseInt(document.getElementById('v-seats').value),
                odometer: parseInt(document.getElementById('v-odometer').value),
                cost: parseInt(document.getElementById('v-cost').value),
                status: "Available"
            });
            vehicleForm.reset();
            renderFleetTable();
        });
    }

    // ==========================================
    // 4. DRIVER SAFETY REGISTRY HANDLERS (NEW)
    // ==========================================
    const driverForm = document.getElementById('driver-form');
    const driverListBody = document.getElementById('driver-list-body');

    // Default Seed Profiles initialized straight from layout sheet sketch
    let driverDatabase = JSON.parse(localStorage.getItem('transitops_drivers')) || [
        { name: "Alex", license: "DL-88213", category: "LMV", expiry: "2028-12-31", phone: "98765XXXXX", score: 96, status: "Available" },
        { name: "John", license: "DL-44120", category: "HMV", expiry: "2026-03-15", phone: "98220XXXXX", score: 81, status: "Suspended" },
        { name: "Priya", license: "DL-77031", category: "LMV", expiry: "2029-08-20", phone: "99110XXXXX", score: 99, status: "On Trip" }
    ];

    function renderDriverTable() {
        if (!driverListBody) return;
        driverListBody.innerHTML = "";

        driverDatabase.forEach(function(driver, index) {
            const rowHTML = `
                <tr>
                    <td><strong>${driver.name}</strong></td>
                    <td><code>${driver.license}</code></td>
                    <td><span class="role-tag">${driver.category}</span></td>
                    <td>${driver.expiry}</td>
                    <td>${driver.phone}</td>
                    <td>
                        <div style="font-weight:bold; color: ${driver.score >= 90 ? '#10b981' : '#f59e0b'}">
                            ${driver.score}%
                        </div>
                    </td>
                    <td><span class="badge ${getDriverStatusClass(driver.status)}">${driver.status}</span></td>
                    <td><button class="btn-delete-row delete-driver" data-index="${index}">Remove</button></td>
                </tr>
            `;
            driverListBody.innerHTML += rowHTML;
        });

        localStorage.setItem('transitops_drivers', JSON.stringify(driverDatabase));
    }

    function getDriverStatusClass(status) {
        if (status === "Available") return "status-completed";
        if (status === "On Trip") return "status-ontrip";
        if (status === "Off Duty") return "status-draft";
        return "status-suspended"; // Handled nicely via custom CSS styling blocks
    }

    if (driverForm) {
        driverForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const inputLicense = document.getElementById('d-license').value.trim().toUpperCase();
            
            // Core Business Logic: Enforce Unique Identity values per registration records
            if (driverDatabase.find(d => d.license === inputLicense)) {
                alert("Operational Error: A driver profile with this License Number already exists.");
                return;
            }

            driverDatabase.push({
                name: document.getElementById('d-name').value.trim(),
                phone: document.getElementById('d-phone').value.trim(),
                license: inputLicense,
                expiry: document.getElementById('d-expiry').value,
                category: document.getElementById('d-category').value,
                score: parseInt(document.getElementById('d-score').value),
                status: document.getElementById('d-status').value
            });

            driverForm.reset();
            renderDriverTable();
        });
    }

    // Active delegation handling removal arrays parameters 
    if (driverListBody) {
        driverListBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-driver')) {
                const index = e.target.getAttribute('data-index');
                if (confirm("Permanently archive this operator safety profile layout?")) {
                    driverDatabase.splice(index, 1);
                    renderDriverTable();
                }
            }
        });
    }

    // Helper conversion mappings
    function getStatusClass(status) {
        if (status === "Available") return "status-completed";
        if (status === "On Trip") return "status-ontrip";
        return "status-draft";
    }

    // Initialize both registry components on render loop entry
    renderFleetTable();
    renderDriverTable();
});