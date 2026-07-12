document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // 1. Check local storage on page load to apply saved preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️ Light Mode';
    }

    // 2. Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Save choice & update button label
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️ Light Mode';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙 Dark Mode';
        }
    });

    
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
    // 2. UNIFIED TAB & KPI NAVIGATION CONTROLLER
    // ==========================================
    const menuItems = document.querySelectorAll('.menu-item');
    const viewSections = document.querySelectorAll('.view-section');
    const globalKpiGrid = document.getElementById('global-kpi-grid');

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

            // Isolate KPI Visibility specifically to the Home Dashboard view container
            if (globalKpiGrid) {
                globalKpiGrid.style.display = (targetId === 'dashboard-view') ? "grid" : "none";
            }

            if (targetId === 'fleet-view') renderFleetTable();
            if (targetId === 'trips-view') populateDispatchDropdowns();
            if (targetId === 'maintenance-view') {
                populateMaintenanceDropdown();
                renderMaintenanceTable();
            }
            if (targetId === 'fuel-view') {
                populateExpenseDropdown();
                renderExpenseTable();
            }
            if (targetId === 'analytics-view') {
                renderAnalyticsView();
            }
            if (targetId === 'settings-view') {
                loadSystemSettings();
            }
        });
    });

    // ==========================================
    // 3. FLEET INTERNAL SUB-TAB NAVIGATION
    // ==========================================
    const fleetSubTabs = document.querySelectorAll('.fleet-sub-tab');
    const fleetPanes = document.querySelectorAll('.fleet-pane');

    fleetSubTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            fleetSubTabs.forEach(t => {
                t.classList.remove('active');
                t.style.color = '#64748b';
                t.style.borderBottom = 'none';
                t.style.fontWeight = '500';
            });
            
            this.classList.add('active');
            this.style.color = '#2563eb';
            this.style.borderBottom = '2px solid #2563eb';
            this.style.fontWeight = '600';
            this.style.marginBottom = '-12px';

            const activePaneId = this.getAttribute('data-sub');
            fleetPanes.forEach(pane => {
                pane.style.display = (pane.id === activePaneId) ? 'block' : 'none';
            });

            if (activePaneId === 'fleet-matrix-pane') {
                renderFleetTable();
            }
        });
    });

    // ==========================================
    // 4. VEHICLE FLEET ENGINE & MATRIX FILTERS
    // ==========================================
    const vehicleForm = document.getElementById('vehicle-form');
    const vehicleListBody = document.getElementById('vehicle-list-body');
    const filterFleetType = document.getElementById('filter-fleet-type');
    const filterFleetStatus = document.getElementById('filter-fleet-status');

    let fleetDatabase = JSON.parse(localStorage.getItem('transitops_fleet')) || [
        { id: "VAN-05", reg: "GJ01AB4521", type: "Van", fuel: "Diesel", capacity: 500, seats: 2, odometer: 74000, cost: 620000, status: "Available" },
        { id: "TRUCK-11", reg: "GJ01AB9981", type: "Truck", fuel: "Diesel", capacity: 5000, seats: 3, odometer: 182000, cost: 2450000, status: "On Trip" },
        { id: "MINI-03", reg: "GJ01AB1120", type: "Mini", fuel: "Petrol", capacity: 1000, seats: 2, odometer: 66000, cost: 410000, status: "In Shop" },
        { id: "VAN-09", reg: "GJ01AB0008", type: "Van", fuel: "Diesel", capacity: 750, seats: 2, odometer: 241900, cost: 590000, status: "Retired" }
    ];

    function renderFleetTable() {
        if (!vehicleListBody) return;
        vehicleListBody.innerHTML = "";
        
        const currencySymbol = getGlobalCurrencySymbol();
        const distanceUnit = getGlobalDistanceUnit();
        const selectedType = filterFleetType ? filterFleetType.value : "All";
        const selectedStatus = filterFleetStatus ? filterFleetStatus.value : "All";
        
        fleetDatabase.forEach(function(vehicle, index) {
            // Apply classification multi-selector logical matching
            if (selectedType !== "All" && vehicle.type !== selectedType) return;
            if (selectedStatus !== "All" && vehicle.status !== selectedStatus) return;

            const formattedCost = vehicle.cost ? Number(vehicle.cost).toLocaleString() : '0';
            
            const rowHTML = `
                <tr>
                    <td><strong>${vehicle.id}</strong></td>
                    <td><code>${vehicle.reg}</code></td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.fuel}</td>
                    <td>${vehicle.capacity}kg</td>
                    <td>${vehicle.odometer} ${distanceUnit}</td>
                    <td>${currencySymbol}${formattedCost}</td>
                    <td><span class="badge ${getStatusClass(vehicle.status)}">${vehicle.status}</span></td>
                    <td><button class="btn-delete-row delete-vehicle" data-index="${index}">Remove</button></td>
                </tr>
            `;
            vehicleListBody.innerHTML += rowHTML;
        });

        localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
        updateTopKPIGrid();
    }

    // Attach runtime listeners to the type and status filters
    if (filterFleetType) filterFleetType.addEventListener('change', renderFleetTable);
    if (filterFleetStatus) filterFleetStatus.addEventListener('change', renderFleetTable);

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
            
            // Auto routing flip back to overview pane list upon successful submission
            const matrixTab = document.querySelector('[data-sub="fleet-matrix-pane"]');
            if (matrixTab) matrixTab.click();
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
    // 5. DRIVER MANAGEMENT SYSTEM
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
    
    // Read the value from our mockup status selector dropdown
    const filterDriverStatus = document.getElementById('filter-driver-status');
    const selectedStatus = filterDriverStatus ? filterDriverStatus.value : "All";
    
    driverDatabase.forEach(function(driver, index) {
        // Filter logic matching the mockup layout state
        if (selectedStatus !== "All" && driver.status !== selectedStatus) return;

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
    if (typeof updateTopKPIGrid === "function") updateTopKPIGrid();
}

    if (driverForm) {
        driverForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputLicense = document.getElementById('d-license').value.trim().toUpperCase();
            if (driverDatabase.find(d => d.license === inputLicense)) {
                alert("Operational Error: Driver profile with this License Number already exists.");
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
            // Return view to main database grid upon complete entry
        const ledgerTab = document.querySelector('[data-sub="driver-matrix-pane"]');
        if (ledgerTab) ledgerTab.click();
        });
    }
// ==========================================
// DRIVER INTERNAL SUB-TAB & FILTER CONTROLLER
// ==========================================
const driverSubTabs = document.querySelectorAll('.driver-sub-tab');
const driverPanes = document.querySelectorAll('.driver-pane');
const filterDriverStatus = document.getElementById('filter-driver-status');

driverSubTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        driverSubTabs.forEach(t => {
            t.classList.remove('active');
            if(t.getAttribute('data-sub') === 'driver-form-pane') {
                t.style.background = '#eab308';
                t.style.color = '#ffffff';
            } else {
                t.style.background = '#e2e8f0';
                t.style.color = '#1e293b';
            }
        });
        
        this.classList.add('active');
        this.style.background = '#1e293b';
        this.style.color = '#ffffff';

        const activePaneId = this.getAttribute('data-sub');
        driverPanes.forEach(pane => {
            pane.style.display = (pane.id === activePaneId) ? 'block' : 'none';
        });

        if (activePaneId === 'driver-matrix-pane') {
            renderDriverTable();
        }
    });
});

// Watch for layout filter dropdown changes
if (filterDriverStatus) {
    filterDriverStatus.removeEventListener('change', renderDriverTable); // Avoid double-binding
    filterDriverStatus.addEventListener('change', renderDriverTable);
}

    // ==========================================
    // 6. TRIP MANAGEMENT & LOGISTICS ENGINE
    // ==========================================
    const tripForm = document.getElementById('trip-form');
    const vehicleSelect = document.getElementById('t-vehicle');
    const driverSelect = document.getElementById('t-driver');
    const cargoWeightInput = document.getElementById('t-weight');
    const capacityAlertBanner = document.getElementById('capacity-alert-banner');
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
            vehicleSelect.innerHTML += `<option value="${v.id}" data-cap="${v.capacity}">${v.id} (Max: ${v.capacity}kg)</option>';`;
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

    if (tripForm) {
        tripForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedVehicle = vehicleSelect.value;
            const selectedDriver = driverSelect.value;
            const generatedId = "TR00" + (tripsDatabase.length + 1);

            tripsDatabase.push({
                id: generatedId,
                source: document.getElementById('t-source').value.trim(),
                destination: document.getElementById('t-destination').value.trim(),
                vehicle: selectedVehicle,
                driver: selectedDriver,
                weight: parseInt(cargoWeightInput.value),
                distance: parseInt(document.getElementById('t-distance').value),
                status: "Dispatched",
                note: "Just launched"
            });

            const vehicleObj = fleetDatabase.find(v => v.id === selectedVehicle);
            if (vehicleObj) vehicleObj.status = "On Trip";

            const driverObj = driverDatabase.find(d => d.name === selectedDriver);
            if (driverObj) driverObj.status = "On Trip";

            tripForm.reset();
            if (capacityAlertBanner) capacityAlertBanner.style.display = "none";
            
            localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
            localStorage.setItem('transitops_drivers', JSON.stringify(driverDatabase));
            
            populateDispatchDropdowns();
            renderTripsManagement();
        });
    }

    function renderTripsManagement() {
        if (!liveBoardContainer) return;
        liveBoardContainer.innerHTML = "";
        const distanceUnit = getGlobalDistanceUnit();
        
        tripsDatabase.forEach((trip, index) => {
            liveBoardContainer.innerHTML += `
                <div class="live-board-card">
                    <div class="card-header-row">
                        <span class="trip-id-tag"><strong>${trip.id}</strong></span>
                        <span class="badge ${getTripBadgeClass(trip.status)}">${trip.status}</span>
                    </div>
                    <div class="route-details">
                        <p class="route-text">📍 <strong>${trip.source}</strong> &rarr; <strong>${trip.destination}</strong></p>
                        <p class="asset-meta">🚛 Asset: <code>${trip.vehicle}</code> / Driver: <strong>${trip.driver}</strong></p>
                        <p class="log-meta">📦 Cargo: ${trip.weight} kg | 🛣7 Route: ${trip.distance} ${distanceUnit}</p>
                    </div>
                    <div class="card-actions-row">
                        <select class="status-pipeline-select" data-index="${index}">
                            <option value="Draft" ${trip.status === 'Draft' ? 'selected' : ''}>Draft</option>
                            <option value="Dispatched" ${trip.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                            <option value="Completed" ${trip.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${trip.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </div>
            `;
        });

        localStorage.setItem('transitops_trips', JSON.stringify(tripsDatabase));
        renderMirrorHomeDashboard();
        updateTopKPIGrid();
    }

    function renderMirrorHomeDashboard() {
        if (!homeTripsBody) return;
        homeTripsBody.innerHTML = "";
        tripsDatabase.forEach(trip => {
            homeTripsBody.innerHTML += `
                <tr>
                    <td><strong>${trip.id}</strong></td>
                    <td>${trip.vehicle}</td>
                    <td>${trip.driver}</td>
                    <td><span class="badge ${getTripBadgeClass(trip.status)}">${trip.status}</span></td>
                    <td>${trip.note || '--'}</td>
                </tr>
            `;
        });
    }

    if (liveBoardContainer) {
        liveBoardContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('status-pipeline-select')) {
                const index = e.target.getAttribute('data-index');
                const newStatus = e.target.value;
                const activeTrip = tripsDatabase[index];

                if (newStatus === "Completed" || newStatus === "Cancelled") {
                    const vehicleObj = fleetDatabase.find(v => v.id === activeTrip.vehicle);
                    if (vehicleObj) vehicleObj.status = "Available";

                    const driverObj = driverDatabase.find(d => d.name === activeTrip.driver);
                    if (driverObj) driverObj.status = "Available";
                }

                activeTrip.status = newStatus;

                localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
                localStorage.setItem('transitops_drivers', JSON.stringify(driverDatabase));
                
                populateDispatchDropdowns();
                renderTripsManagement();
            }
        });
    }

    // ==========================================
    // 7. VEHICLE MAINTENANCE LOGS MODULE
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
        const currencySymbol = getGlobalCurrencySymbol();
        
        maintenanceDatabase.forEach((item, index) => {
            maintenanceListBody.innerHTML += `
                <tr>
                    <td><strong>${item.vehicle}</strong></td>
                    <td>${item.type}</td>
                    <td>${currencySymbol}${item.cost ? item.cost.toLocaleString() : '0'}</td>
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
        updateTopKPIGrid();
    }

    // ==========================================
    // 8. FUEL & EXPENSES MANAGEMENT MODULE
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
        const rawExpenseSum = expenseDatabase.reduce((acc, curr) => acc + (parseInt(curr.amount) || 0), 0);
        const rawMaintenanceSum = maintenanceDatabase.reduce((acc, curr) => acc + (parseInt(curr.cost) || 0), 0);
        const currencySymbol = getGlobalCurrencySymbol();
        if (overheadTotalDisplay) overheadTotalDisplay.innerText = currencySymbol + (rawExpenseSum + rawMaintenanceSum).toLocaleString();
    }

    function renderExpenseTable() {
        if (!expenseListBody) return;
        expenseListBody.innerHTML = "";
        const currencySymbol = getGlobalCurrencySymbol();
        
        expenseDatabase.forEach(item => {
            expenseListBody.innerHTML += `<tr><td><strong>${item.vehicle}</strong></td><td><span class="role-tag">${item.type}</span></td><td>${currencySymbol}${parseInt(item.amount).toLocaleString()}</td><td><code>${item.invoice}</code></td><td>${item.date}</td></tr>`;
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
    // 9. OPERATIONS ANALYTICS & REPORTS MODULE
    // ==========================================
    const analyticsUtilizationDisplay = document.getElementById('analytics-utilization-display');
    const analyticsSafetyDisplay = document.getElementById('analytics-safety-display');
    const analyticsPipelineBody = document.getElementById('analytics-pipeline-body');

    function renderAnalyticsView() {
        if (analyticsUtilizationDisplay) {
            const totalVehiclesCount = fleetDatabase.length;
            const activeVehiclesCount = fleetDatabase.filter(v => v.status === "On Trip").length;
            const utilizationPercentage = totalVehiclesCount > 0 ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) : 0;
            analyticsUtilizationDisplay.innerText = `${utilizationPercentage}%`;
        }

        if (analyticsSafetyDisplay) {
            const totalDriversCount = driverDatabase.length;
            const compositeScoreSum = driverDatabase.reduce((acc, curr) => acc + (parseInt(curr.score) || 0), 0);
            const averageSafetyMean = totalDriversCount > 0 ? Math.round(compositeScoreSum / totalDriversCount) : 0;
            analyticsSafetyDisplay.innerText = `${averageSafetyMean}%`;
        }

        if (!analyticsPipelineBody) return;
        analyticsPipelineBody.innerHTML = "";

        tripsDatabase.forEach(trip => {
            let dynamicRowStyle = "";
            if (trip.status === "Completed") dynamicRowStyle = "style='background-color: #f0fdf4;'";
            if (trip.status === "Cancelled") dynamicRowStyle = "style='background-color: #fef2f2;'";
            if (trip.status === "Dispatched") dynamicRowStyle = "style='background-color: #eff6ff;'";

            analyticsPipelineBody.innerHTML += `
                <tr ${dynamicRowStyle}>
                    <td><strong>${trip.id}</strong></td>
                    <td>📍 <code>${trip.source}</code> &rarr; <code>${trip.destination}</code></td>
                    <td><code>${trip.vehicle}</code></td>
                    <td><strong>${trip.driver}</strong></td>
                    <td><span class="badge ${getTripBadgeClass(trip.status)}">${trip.status}</span></td>
                </tr>
            `;
        });
    }

    // Dynamic global dashboard metric synced states
    function updateTopKPIGrid() {
        const activeV = fleetDatabase.filter(v => v.status === "On Trip").length;
        const availV = fleetDatabase.filter(v => v.status === "Available").length;
        const maintV = fleetDatabase.filter(v => v.status === "In Shop").length;
        const activeT = tripsDatabase.filter(t => t.status === "Dispatched").length;
        const pendT = tripsDatabase.filter(t => t.status === "Draft").length;
        const activeD = driverDatabase.filter(d => d.status === "On Trip").length;
        const utilPercent = fleetDatabase.length > 0 ? Math.round((activeV / fleetDatabase.length) * 100) : 0;

        if(document.getElementById('kpi-active-vehicles')) document.getElementById('kpi-active-vehicles').innerText = activeV;
        if(document.getElementById('kpi-available-vehicles')) document.getElementById('kpi-available-vehicles').innerText = availV;
        if(document.getElementById('kpi-in-maintenance')) document.getElementById('kpi-in-maintenance').innerText = maintV;
        if(document.getElementById('kpi-active-trips')) document.getElementById('kpi-active-trips').innerText = activeT;
        if(document.getElementById('kpi-pending-trips')) document.getElementById('kpi-pending-trips').innerText = pendT;
        if(document.getElementById('kpi-drivers-duty')) document.getElementById('kpi-drivers-duty').innerText = activeD;
        if(document.getElementById('kpi-fleet-utilization')) document.getElementById('kpi-fleet-utilization').innerText = `${utilPercent}%`;
    }

    // ==========================================
    // 10. SETTINGS & SYSTEM PREFERENCES ENGINE
    // ==========================================
    const settingsForm = document.getElementById('settings-general-form');
    const setDepotInput = document.getElementById('set-depot');
    const setCurrencyInput = document.getElementById('set-currency');
    const setUnitInput = document.getElementById('set-unit');

    let systemPreferences = JSON.parse(localStorage.getItem('transitops_settings')) || {
        depotName: "Gandhinagar Depot GJ1",
        currency: "INR (Rs)",
        distanceUnit: "Kilometers"
    };

    function loadSystemSettings() {
        if (!setDepotInput || !setCurrencyInput || !setUnitInput) return;
        setDepotInput.value = systemPreferences.depotName;
        setCurrencyInput.value = systemPreferences.currency;
        setUnitInput.value = systemPreferences.distanceUnit;
    }

    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            systemPreferences.depotName = setDepotInput.value.trim();
            systemPreferences.currency = setCurrencyInput.value.trim();
            systemPreferences.distanceUnit = setUnitInput.value.trim();
            
            localStorage.setItem('transitops_settings', JSON.stringify(systemPreferences));
            alert("Workspace configuration updated successfully!");
            
            renderFleetTable();
            renderExpenseTable();
            renderMaintenanceTable();
            renderTripsManagement();
        });
    }

    function getGlobalCurrencySymbol() {
        const value = systemPreferences.currency.toLowerCase();
        if (value.includes('inr') || value.includes('rs')) return '₹';
        if (value.includes('usd') || value.includes('$')) return '$';
        if (value.includes('eur')) return '€';
        return '';
    }

    function getGlobalDistanceUnit() {
        const value = systemPreferences.distanceUnit.toLowerCase();
        if (value.includes('kilometer') || value.includes('km')) return 'km';
        if (value.includes('mile')) return 'mi';
        return 'km';
    }

    // ==========================================
    // 11. UTILITY HELPER FUNCTIONS
    // ==========================================
    function getTripBadgeClass(status) {
        if (status === "Draft") return "status-draft";
        if (status === "Dispatched") return "status-ontrip";
        if (status === "Completed") return "status-completed";
        return "status-suspended";
    }

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
    // 12. GLOBAL RENDER ENGINE BOOT INITIALIZATION
    // ==========================================
    renderMirrorHomeDashboard();
    updateTopKPIGrid();
    
    // Explicit initial toggle check to ensure KPI values hide if initial reload land isn't home view
    if (globalKpiGrid) globalKpiGrid.style.display = "grid";
});