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

            if (targetId === 'trips-view') {
                populateDispatchDropdowns();
            }
            if (targetId === 'maintenance-view') {
                populateMaintenanceDropdown();
                renderMaintenanceTable();
            }
            if (targetId === 'fuel-view') {
                populateExpenseDropdown();
                renderExpenseTable();
            }
        });
    });

    // ==========================================
    // 3. VEHICLE FLEET MANAGEMENT SYSTEM
    // ==========================================
    const vehicleForm = document.getElementById('vehicle-form');
    const vehicleListBody = document.getElementById('vehicle-list-body');

    let fleetDatabase = JSON.parse(localStorage.getItem('transitops_fleet')) || [
        { id: "VAN-05", reg: "GJ01AB4521", type: "Van", fuel: "Diesel", capacity: 500, seats: 2, odometer: 74000, cost: 620000, status: "Available" },
        { id: "TRUCK-11", reg: "GJ01AB9981", type: "Truck", fuel: "Diesel", capacity: 5000, seats: 3, odometer: 182000, cost: 2450000, status: "On Trip" },
        { id: "MINI-03", reg: "GJ01AB1120", type: "Mini", fuel: "Petrol", capacity: 1000, seats: 2, odometer: 66000, cost: 410000, status: "In Shop" },
        { id: "VAN-09", reg: "GJ01AB0008", type: "Van", fuel: "Diesel", capacity: 750, seats: 2, odometer: 241900, cost: 590000, status: "Retired" }
    ];

    function renderFleetTable() {
        if (!vehicleListBody) return;
        vehicleListBody.innerHTML = "";
        fleetDatabase.forEach(function(vehicle, index) {
            const formattedCost = vehicle.cost ? Number(vehicle.cost).toLocaleString() : '0';
            const rowHTML = `
                <tr>
                    <td><strong>${vehicle.id}</strong></td>
                    <td><code>${vehicle.reg}</code></td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.fuel}</td>
                    <td>${vehicle.capacity}kg</td>
                    <td>${vehicle.odometer} km</td>
                    <td>₹${formattedCost}</td>
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

    if (vehicleListBody) {
        vehicleListBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-vehicle')) {
                const index = e.target.getAttribute('data-index');
                if (confirm("De-register this active fleet asset permanently?")) {
                    fleetDatabase.splice(index, 1);
                    renderFleetTable();
                }
            }
        });
    }

    // ==========================================
    // 4. DRIVER MANAGEMENT SYSTEM
    // ==========================================
    const driverForm = document.getElementById('driver-form');
    const driverListBody = document.getElementById('driver-list-body');

    let driverDatabase = JSON.parse(localStorage.getItem('transitops_drivers')) || [
        { name: "Alex", license: "DL-88213", category: "LMV", expiry: "2028-12-31", phone: "98765XXXXX", score: 96, status: "Available" },
        { name: "John", license: "DL-44120", category: "HMV", expiry: "2026-03-15", phone: "98220XXXXX", score: 81, status: "Suspended" },
        { name: "Priya", license: "DL-77031", category: "LMV", expiry: "2029-08-20", phone: "99110XXXXX", score: 99, status: "On Trip" },
        { name: "Suresh", license: "DL-90045", category: "HMV", expiry: "2027-01-10", phone: "97440XXXXX", score: 88, status: "Off Duty" }
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
                    <td><div style="font-weight:bold; color: ${driver.score >= 90 ? '#10b981' : '#f59e0b'}">${driver.score}%</div></td>
                    <td><span class="badge ${getDriverStatusClass(driver.status)}">${driver.status}</span></td>
                    <td><button class="btn-delete-row delete-driver" data-index="${index}">Remove</button></td>
                </tr>
            `;
            driverListBody.innerHTML += rowHTML;
        });
        localStorage.setItem('transitops_drivers', JSON.stringify(driverDatabase));
    }

    if (driverForm) {
        driverForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputLicense = document.getElementById('d-license').value.trim().toUpperCase();
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

    // ==========================================
    // 5. TRIP MANAGEMENT & LOGISTICS ENGINE
    // ==========================================
    const tripForm = document.getElementById('trip-form');
    const vehicleSelect = document.getElementById('t-vehicle');
    const driverSelect = document.getElementById('t-driver');
    const cargoWeightInput = document.getElementById('t-weight');
    const capacityAlertBanner = document.getElementById('capacity-alert-banner');
    const btnDispatchSubmit = document.getElementById('btn-dispatch-submit');
    const liveBoardContainer = document.getElementById('live-board-container');
    const homeTripsBody = document.getElementById('home-trips-body');

    let tripsDatabase = JSON.parse(localStorage.getItem('transitops_trips')) || [
        { id: "TR001", source: "Gandhinagar Depot", destination: "Ahmedabad Hub", vehicle: "VAN-05", driver: "Alex", weight: 450, distance: 38, status: "Dispatched", note: "45 min" },
        { id: "TR002", source: "Vatva Industrial Area", destination: "Sanand Warehouse", vehicle: "TRUCK-11", driver: "Priya", weight: 2000, distance: 55, status: "Draft", note: "Awaiting driver" }
    ];

    function populateDispatchDropdowns() {
        if (!vehicleSelect || !driverSelect) return;
        vehicleSelect.innerHTML = '<option value="">-- Select Active Fleet --</option>';
        fleetDatabase.filter(v => v.status === "Available").forEach(v => {
            vehicleSelect.innerHTML += `<option value="${v.id}" data-cap="${v.capacity}">${v.id} (Max: ${v.capacity}kg)</option>`;
        });
        driverSelect.innerHTML = '<option value="">-- Select Operator --</option>';
        driverDatabase.filter(d => d.status === "Available").forEach(d => {
            driverSelect.innerHTML += `<option value="${d.name}">${d.name} (Score: ${d.score}%)</option>`;
        });
    }

    function checkCapacityValidation() {
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value || !cargoWeightInput.value) {
            if (capacityAlertBanner) capacityAlertBanner.style.display = "none";
            return;
        }
        const vehicleCapacity = parseInt(selectedOption.getAttribute('data-cap'));
        const inputtedWeight = parseInt(cargoWeightInput.value);
        if (capacityAlertBanner) capacityAlertBanner.style.display = (inputtedWeight > vehicleCapacity) ? "block" : "none";
    }

    if (vehicleSelect && cargoWeightInput) {
        vehicleSelect.addEventListener('change', checkCapacityValidation);
        cargoWeightInput.addEventListener('input', checkCapacityValidation);
    }

    // ==========================================
    // 6. VEHICLE MAINTENANCE LOGS MODULE
    // ==========================================
    const maintenanceVehicleSelect = document.getElementById('m-vehicle');
    const maintenanceListBody = document.getElementById('maintenance-list-body');

    let maintenanceDatabase = JSON.parse(localStorage.getItem('transitops_maintenance')) || [
        { vehicle: "VAN-05", type: "Oil Change", cost: 2500, date: "2026-07-07", status: "In Shop" },
        { vehicle: "TRUCK-11", type: "Engine Repair", cost: 18000, date: "2026-07-05", status: "Completed" },
        { vehicle: "MINI-03", type: "Tyre Replace", cost: 6200, date: "2026-07-06", status: "In Shop" }
    ];

    function populateMaintenanceDropdown() {
        if (!maintenanceVehicleSelect) return;
        maintenanceVehicleSelect.innerHTML = '<option value="">-- Select Fleet Asset --</option>';
        fleetDatabase.forEach(v => {
            maintenanceVehicleSelect.innerHTML += `<option value="${v.id}">${v.id} (${v.status})</option>`;
        });
    }

    function renderMaintenanceTable() {
        if (!maintenanceListBody) return;
        maintenanceListBody.innerHTML = "";
        maintenanceDatabase.forEach((item, index) => {
            maintenanceListBody.innerHTML += `
                <tr>
                    <td><strong>${item.vehicle}</strong></td>
                    <td>${item.type}</td>
                    <td>₹${item.cost ? item.cost.toLocaleString() : '0'}</td>
                    <td>
                        <select class="maintenance-state-select status-badge ${item.status === 'Completed' ? 'status-completed' : 'status-orange'}" data-index="${index}">
                            <option value="In Shop" ${item.status === 'In Shop' ? 'selected' : ''}>In Shop</option>
                            <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                </tr>
            `;
        });
        localStorage.setItem('transitops_maintenance', JSON.stringify(maintenanceDatabase));
    }

    // ==========================================
    // 7. FUEL & EXPENSES MANAGEMENT MODULE (NEW)
    // ==========================================
    const expenseForm = document.getElementById('expense-form');
    const expenseVehicleSelect = document.getElementById('e-vehicle');
    const expenseTypeSelect = document.getElementById('e-type');
    const expenseAmountInput = document.getElementById('e-amount');
    const expenseListBody = document.getElementById('expense-list-body');
    const fuelLimitAlert = document.getElementById('fuel-limit-alert');
    const btnExpenseSubmit = document.getElementById('btn-expense-submit');
    const overheadTotalDisplay = document.getElementById('overhead-total-display');

    let expenseDatabase = JSON.parse(localStorage.getItem('transitops_expenses')) || [
        { vehicle: "VAN-05", type: "Fuel", amount: 4200, invoice: "INV-8810", date: "2026-07-10" },
        { vehicle: "TRUCK-11", type: "Toll", amount: 850, invoice: "INV-1102", date: "2026-07-11" }
    ];

    function populateExpenseDropdown() {
        if (!expenseVehicleSelect) return;
        expenseVehicleSelect.innerHTML = '<option value="">-- Select Fleet Asset --</option>';
        fleetDatabase.forEach(v => {
            expenseVehicleSelect.innerHTML += `<option value="${v.id}">${v.id}</option>`;
        });
    }

    // Live validation rule check matching your structural constraints sheet
    function validateExpenseAmount() {
        if (!expenseTypeSelect || !expenseAmountInput || !fuelLimitAlert || !btnExpenseSubmit) return;
        
        const typeValue = expenseTypeSelect.value;
        const amountValue = parseInt(expenseAmountInput.value) || 0;

        if (typeValue === "Fuel" && amountValue > 10000) {
            fuelLimitAlert.style.display = "block";
            btnExpenseSubmit.disabled = true;
            btnExpenseSubmit.style.opacity = "0.5";
            btnExpenseSubmit.style.cursor = "not-allowed";
        } else {
            fuelLimitAlert.style.display = "none";
            btnExpenseSubmit.disabled = false;
            btnExpenseSubmit.style.opacity = "1";
            btnExpenseSubmit.style.cursor = "pointer";
        }
    }

    if (expenseTypeSelect && expenseAmountInput) {
        expenseTypeSelect.addEventListener('change', validateExpenseAmount);
        expenseAmountInput.addEventListener('input', validateExpenseAmount);
    }

    function calculateAndDisplayOverhead() {
        if (!overheadTotalDisplay) return;
        
        // Sum expenses matrix arrays
        const rawExpenseSum = expenseDatabase.reduce((acc, curr) => acc + (parseInt(curr.amount) || 0), 0);
        // Sum maintenance arrays
        const rawMaintenanceSum = maintenanceDatabase.reduce((acc, curr) => acc + (parseInt(curr.cost) || 0), 0);
        
        const overallOverheadTotal = rawExpenseSum + rawMaintenanceSum;
        overheadTotalDisplay.innerText = "₹" + overallOverheadTotal.toLocaleString();
    }

    function renderExpenseTable() {
        if (!expenseListBody) return;
        expenseListBody.innerHTML = "";
        
        expenseDatabase.forEach(item => {
            expenseListBody.innerHTML += `
                <tr>
                    <td><strong>${item.vehicle}</strong></td>
                    <td><span class="role-tag">${item.type}</span></td>
                    <td>₹${parseInt(item.amount).toLocaleString()}</td>
                    <td><code>${item.invoice}</code></td>
                    <td>${item.date}</td>
                </tr>
            `;
        });

        localStorage.setItem('transitops_expenses', JSON.stringify(expenseDatabase));
        calculateAndDisplayOverhead();
    }

    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            expenseDatabase.push({
                vehicle: expenseVehicleSelect.value,
                type: expenseTypeSelect.value,
                amount: parseInt(expenseAmountInput.value),
                date: document.getElementById('e-date').value,
                invoice: document.getElementById('e-invoice').value.trim().toUpperCase()
            });

            expenseForm.reset();
            renderExpenseTable();
        });
    }

    // ==========================================
    // 8. UTILITY HELPER FUNCTIONS
    // ==========================================
    function getStatusClass(status) {
        if (status === "Available") return "status-completed";
        if (status === "On Trip") return "status-ontrip";
        if (status === "In Shop") return "status-orange";
        return "status-suspended";
    }

    function getDriverStatusClass(status) {
        if (status === "Available") return "status-completed";
        if (status === "On Trip") return "status-ontrip";
        if (status === "Off Duty") return "status-draft";
        return "status-suspended";
    }

    // ==========================================
    // 9. GLOBAL RENDER ENGINE BOOT INITIALIZATION
    // ==========================================
    renderFleetTable();
    renderDriverTable();
    populateMaintenanceDropdown();
    renderMaintenanceTable();
    populateExpenseDropdown();
    renderExpenseTable();
});