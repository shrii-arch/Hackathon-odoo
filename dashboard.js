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

            // Re-sync asset drops whenever switching into operations window
            if (targetId === 'trips-view') {
                populateDispatchDropdowns();
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

    // ==========================================
    // 5. TRIP MANAGEMENT & LOGISTICS ENGINE (NEW)
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
        { id: "TR002", source: "Vatva Industrial Area", destination: "Sanand Warehouse", vehicle: "TRUCK-04", driver: "Suresh", weight: 2000, distance: 55, status: "Draft", note: "Awaiting driver" },
        { id: "TR003", source: "Mansa Depot", destination: "Kalol Depot", vehicle: "Unassigned", driver: "Unassigned", weight: 0, distance: 22, status: "Cancelled", note: "Vehicle went to shop" }
    ];

    function populateDispatchDropdowns() {
        if (!vehicleSelect || !driverSelect) return;
        
        // Populate Available Fleet options
        vehicleSelect.innerHTML = '<option value="">-- Select Active Fleet --</option>';
        fleetDatabase.filter(v => v.status === "Available").forEach(v => {
            vehicleSelect.innerHTML += `<option value="${v.id}" data-cap="${v.capacity}">${v.id} (Max: ${v.capacity}kg)</option>`;
        });

        // Populate Available Operator options
        driverSelect.innerHTML = '<option value="">-- Select Operator --</option>';
        driverDatabase.filter(d => d.status === "Available").forEach(d => {
            driverSelect.innerHTML += `<option value="${d.name}">${d.name} (Score: ${d.score}%)</option>`;
        });
    }

    // Live validation loop tracking capacity violations
    function checkCapacityValidation() {
        const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value || !cargoWeightInput.value) {
            capacityAlertBanner.style.display = "none";
            btnDispatchSubmit.disabled = false;
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

            // Append new transaction structure into core array records
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

            // Update underlying statuses to maintain single source of truth across components
            const vehicleObj = fleetDatabase.find(v => v.id === selectedVehicle);
            if (vehicleObj) vehicleObj.status = "On Trip";

            const driverObj = driverDatabase.find(d => d.name === selectedDriver);
            if (driverObj) driverObj.status = "On Trip";

            // Clean, persist, and update view components
            tripForm.reset();
            capacityAlertBanner.style.display = "none";
            btnDispatchSubmit.disabled = false;
            btnDispatchSubmit.style.opacity = "1";
            
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
        
        // Loop execution loading customized Live Cards block metrics
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

    // Mirroring functions updating global overview grids component parameters
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

    // Dynamic state listener monitoring lifecycle status upgrades
    if (liveBoardContainer) {
        liveBoardContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('status-pipeline-select')) {
                const index = e.target.getAttribute('data-index');
                const newStatus = e.target.value;
                const activeTrip = tripsDatabase[index];

                // Business Logic Cleanup: Release locked vehicles/drivers back to fleet upon trip conclusion
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

    // Global Registry Boot Execution loop
    renderFleetTable();
    renderDriverTable();
    populateDispatchDropdowns();
    renderTripsManagement();
});