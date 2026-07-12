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
            const rowHTML = `
                <tr>
                    <td><strong>${vehicle.id}</strong></td>
                    <td><code>${vehicle.reg}</code></td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.fuel}</td>
                    <td>${vehicle.capacity}kg</td>
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
            // FIX: Repaired missing backtick closure error sequence here
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
            if (btnDispatchSubmit) {
                btnDispatchSubmit.disabled = false;
                btnDispatchSubmit.style.opacity = "1";
                btnDispatchSubmit.style.cursor = "pointer";
            }
            return;
        }

        const vehicleCapacity = parseInt(selectedOption.getAttribute('data-cap'));
        const inputtedWeight = parseInt(cargoWeightInput.value);

        if (inputtedWeight > vehicleCapacity) {
            capacityAlertBanner.style.display = "block";
            btnDispatchSubmit.disabled = true;
            btnDispatchSubmit.style.opacity = "0.5";
            btnDispatchSubmit.style.cursor = "not-allowed";
        } else {
            capacityAlertBanner.style.display = "none";
            btnDispatchSubmit.disabled = false;
            btnDispatchSubmit.style.opacity = "1";
            btnDispatchSubmit.style.cursor = "pointer";
        }
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
            
            renderFleetTable();
            renderDriverTable();
            populateDispatchDropdowns();
            renderTripsManagement();
        });
    }

    function renderTripsManagement() {
        if (!liveBoardContainer) return;
        liveBoardContainer.innerHTML = "";
        
        tripsDatabase.forEach((trip, index) => {
            const cardHTML = `
                <div class="live-board-card">
                    <div class="card-header-row">
                        <span class="trip-id-tag"><strong>${trip.id}</strong></span>
                        <span class="badge ${getTripBadgeClass(trip.status)}">${trip.status}</span>
                    </div>
                    <div class="route-details">
                        <p class="route-text">📍 <strong>${trip.source}</strong> &rarr; <strong>${trip.destination}</strong></p>
                        <p class="asset-meta">🚛 Asset: <code>${trip.vehicle}</code> / Driver: <strong>${trip.driver}</strong></p>
                        <p class="log-meta">📦 Cargo: ${trip.weight} kg | 🛣️ Route: ${trip.distance} km</p>
                        ${trip.note ? `<p class="eta-note">⏱️ <em>Note: ${trip.note}</em></p>` : ''}
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
            liveBoardContainer.innerHTML += cardHTML;
        });

        localStorage.setItem('transitops_trips', JSON.stringify(tripsDatabase));
        renderMirrorHomeDashboard();
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
                    
                    activeTrip.note = newStatus === "Completed" ? "Trip closed cleanly" : "Mission aborted";
                }

                activeTrip.status = newStatus;

                localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
                localStorage.setItem('transitops_drivers', JSON.stringify(driverDatabase));
                
                renderFleetTable();
                renderDriverTable();
                populateDispatchDropdowns();
                renderTripsManagement();
            }
        });
    }

    // ==========================================
    // 6. VEHICLE MAINTENANCE LOGS MODULE
    // ==========================================
    const maintenanceForm = document.getElementById('maintenance-form');
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
            const rowHTML = `
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
            maintenanceListBody.innerHTML += rowHTML;
        });
        localStorage.setItem('transitops_maintenance', JSON.stringify(maintenanceDatabase));
    }

    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const targetVehicleId = maintenanceVehicleSelect.value;
            const recordStatus = document.getElementById('m-status').value;

            maintenanceDatabase.push({
                vehicle: targetVehicleId,
                type: document.getElementById('m-type').value.trim(),
                cost: parseInt(document.getElementById('m-cost').value),
                date: document.getElementById('m-date').value,
                status: recordStatus
            });

            const targetedFleetAsset = fleetDatabase.find(v => v.id === targetVehicleId);
            if (targetedFleetAsset) {
                targetedFleetAsset.status = (recordStatus === "In Shop") ? "In Shop" : "Available";
            }

            maintenanceForm.reset();
            localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
            
            renderFleetTable();
            populateMaintenanceDropdown();
            renderMaintenanceTable();
        });
    }

    if (maintenanceListBody) {
        maintenanceListBody.addEventListener('change', function(e) {
            if (e.target.classList.contains('maintenance-state-select')) {
                const index = e.target.getAttribute('data-index');
                const targetNewStatus = e.target.value;
                const targetLogRecord = maintenanceDatabase[index];

                targetLogRecord.status = targetNewStatus;

                const targetedFleetAsset = fleetDatabase.find(v => v.id === targetLogRecord.vehicle);
                if (targetedFleetAsset) {
                    targetedFleetAsset.status = (targetNewStatus === "In Shop") ? "In Shop" : "Available";
                }

                localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
                
                renderFleetTable();
                populateMaintenanceDropdown();
                renderMaintenanceTable();
            }
        });
    }

    // ==========================================
    // 7. UTILITY HELPER FUNCTIONS
    // ==========================================
    function getTripBadgeClass(status) {
        if (status === "Draft") return "status-draft";
        if (status === "Dispatched") return "status-ontrip";
        if (status === "Completed") return "status-completed";
        return "status-suspended";
    }

    // Fixed mapping handling color values dynamically
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
    // 8. GLOBAL RENDER ENGINE BOOT INITIALIZATION
    // ==========================================
    renderFleetTable();
    renderDriverTable();
    populateDispatchDropdowns();
    renderTripsManagement();
    populateMaintenanceDropdown();
    renderMaintenanceTable();
});