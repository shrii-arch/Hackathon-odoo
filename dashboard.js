document.addEventListener('DOMContentLoaded', function() {

    const rawSession = localStorage.getItem('transitops_session');
    if (!rawSession) {
        window.location.href = 'index.html';
        return;
    }
    const contextUserData = JSON.parse(rawSession);
    document.getElementById('profile-name').innerText = contextUserData.userEmail.split('@')[0];
    document.getElementById('profile-role').innerText = contextUserData.userRole;

    // --- 1. TAB TOGGLE SYSTEM NAVIGATION ---
    const menuItems = document.querySelectorAll('.menu-item');
    const dashboardView = document.getElementById('dashboard-view');
    const fleetView = document.getElementById('fleet-view');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active selector tags from all elements
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // Swap visibility containers based on clicked text contents
            if (this.innerText === "Fleet") {
                dashboardView.style.display = "none";
                fleetView.style.display = "block";
            } else if (this.innerText === "Dashboard") {
                dashboardView.style.display = "block";
                fleetView.style.display = "none";
            }
        });
    });

    // --- 2. CRUDE VEHICLE LOGIC ENGINE ---
    const vehicleForm = document.getElementById('vehicle-form');
    const vehicleListBody = document.getElementById('vehicle-list-body');

    // Retrieve database array from browser memory, or seed it with default mockup items
    let fleetDatabase = JSON.parse(localStorage.getItem('transitops_fleet')) || [
        { id: "VAN-05", type: "Van", capacity: 500, status: "Available" },
        { id: "TRK-12", type: "Truck", capacity: 2500, status: "On Trip" },
        { id: "MINI-08", type: "Mini", capacity: 300, status: "In Shop" }
    ];

    // Function to draw data array values to the UI grid table rows
    function renderFleetTable() {
        vehicleListBody.innerHTML = ""; // Wipe current row items to redraw updated states
        
        fleetDatabase.forEach(function(vehicle, index) {
            const rowHTML = `
                <tr>
                    <td><strong>${vehicle.id}</strong></td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.capacity} kg</td>
                    <td><span class="badge ${getStatusClass(vehicle.status)}">${vehicle.status}</span></td>
                    <td><button class="btn-delete-row" data-index="${index}">Remove</button></td>
                </tr>
            `;
            vehicleListBody.innerHTML += rowHTML;
        });

        // Save running array data values directly into persistent local storage notebook
        localStorage.setItem('transitops_fleet', JSON.stringify(fleetDatabase));
    }

    // Dynamic Helper to match status context with background colors
    function getStatusClass(status) {
        if (status === "Available") return "status-completed";
        if (status === "On Trip") return "status-ontrip";
        return "status-draft"; // Fallback placeholder styling
    }

    // Intercept form entries to add values into running dataset array
    vehicleForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const inputID = document.getElementById('v-name').value.trim().toUpperCase();
        const inputType = document.getElementById('v-type').value;
        const inputCapacity = document.getElementById('v-capacity').value;

        // Custom validation checking: prevent registering duplicate matching asset name IDs
        const duplicateCheck = fleetDatabase.find(v => v.id === inputID);
        if (duplicateCheck) {
            alert("Vehicle ID already exists within the system database registry.");
            return;
        }

        // Add item payload object array elements structure
        fleetDatabase.push({
            id: inputID,
            type: inputType,
            capacity: parseInt(inputCapacity),
            status: "Available" // Every newly created asset begins state as functional/ready
        });

        vehicleForm.reset(); // Wipe all form element field values clean
        renderFleetTable(); // Force dynamic view redraw update matching states
    });

    // Handle interactive item deletions using target click tracking event lookups
    vehicleListBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete-row')) {
            const targetIndexPosition = e.target.getAttribute('data-index');
            
            if (confirm("Are you sure you want to completely remove this vehicle asset from operation logs?")) {
                fleetDatabase.splice(targetIndexPosition, 1); // Splice removes element out of array indices
                renderFleetTable(); // Re-render live visualization tables
            }
        }
    });

    // Run table generation on initial page execution initialization
    renderFleetTable();
});