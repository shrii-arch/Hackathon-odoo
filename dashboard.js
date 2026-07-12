document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Verify Authentication Status & Read Role Parameters Safely
    const rawSession = localStorage.getItem('transitops_session');
    if (!rawSession) {
        window.location.href = 'index.html';
        return;
    }
    const contextUserData = JSON.parse(rawSession);
    
    // Bind current user context data straight into the text targets
    const profileNameEl = document.getElementById('profile-name');
    const profileRoleEl = document.getElementById('profile-role');
    
    if (profileNameEl && profileRoleEl) {
        profileNameEl.innerText = contextUserData.userEmail.split('@')[0].toUpperCase();
        profileRoleEl.innerText = contextUserData.userRole;
    }

    // 2. Tab Navigation Component Engine
    const menuItems = document.querySelectorAll('.menu-item');
    const dashboardView = document.getElementById('dashboard-view');
    const fleetView = document.getElementById('fleet-view');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            if (this.innerText.trim() === "Fleet") {
                dashboardView.style.display = "none";
                fleetView.style.display = "block";
            } else if (this.innerText.trim() === "Dashboard") {
                dashboardView.style.display = "block";
                fleetView.style.display = "none";
            }
        });
    });

    // 3. Vehicle Database Processing Engine
    const vehicleForm = document.getElementById('vehicle-form');
    const vehicleListBody = document.getElementById('vehicle-list-body');

    let fleetDatabase = JSON.parse(localStorage.getItem('transitops_fleet')) || [
        { id: "MAHINDRA VAN", reg: "WB-02-A-1111", type: "Van", fuel: "Diesel", capacity: 800, seats: 2, odometer: 15200, cost: 850000, status: "Available" },
        { id: "TATA ULTRA", reg: "WB-02-B-2222", type: "Truck", fuel: "Diesel", capacity: 3500, seats: 3, odometer: 42100, cost: 2100000, status: "On Trip" }
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

    function getStatusClass(status) {
        if (status === "Available") return "status-completed";
        if (status === "On Trip") return "status-ontrip";
        return "status-draft";
    }

    if (vehicleForm) {
        vehicleForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const inputID = document.getElementById('v-name').value.trim().toUpperCase();
            const inputReg = document.getElementById('v-reg').value.trim().toUpperCase();
            const inputType = document.getElementById('v-type').value;
            const inputFuel = document.getElementById('v-fuel').value;
            const inputCapacity = document.getElementById('v-capacity').value;
            const inputSeats = document.getElementById('v-seats').value;
            const inputOdo = document.getElementById('v-odometer').value;
            const inputCost = document.getElementById('v-cost').value;

            const duplicateReg = fleetDatabase.find(v => v.reg === inputReg);
            if (duplicateReg) {
                alert("System Conflict: Registration Number already exists.");
                return;
            }

            fleetDatabase.push({
                id: inputID,
                reg: inputReg,
                type: inputType,
                fuel: inputFuel,
                capacity: parseInt(inputCapacity),
                seats: parseInt(inputSeats),
                odometer: parseInt(inputOdo),
                cost: parseInt(inputCost),
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

    renderFleetTable();
});