const toggleButton = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const sections = {
    'dashboard': document.getElementById('dashboardSection'),
    'customers': document.getElementById('customersSection'),
    'rooms': document.getElementById('roomsSection'),
    'rates': document.getElementById('ratesSection'),
    'bookings': document.getElementById('bookingsSection'),
    'roomBookings': document.getElementById('roomBookingsSection')
};

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-hidden');
});

// Function to hide all sections
function hideAllSections() {
    for (const section in sections) {
        sections[section].classList.add('hidden');
    }
}

// Function to show a specific section
function showSection(sectionId) {
    hideAllSections();
    const section = sections[sectionId];
    if (section) {
        section.classList.remove('hidden');
    } else {
        console.error(`Section with ID ${sectionId} not found.`);
    }
}

// Add click event listeners to sidebar links
document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const sectionId = event.target.getAttribute('data-section-id');
        if (sections.hasOwnProperty(sectionId)) {
            showSection(sectionId);
        }
    });
});

// Show the default section (Dashboard) on page load
showSection('dashboard');

// Function to fetch customers from the backend
function fetchCustomers() {
    fetch('http://localhost:3000/api/customers/')
        .then(response => response.json())
        .then(data => {
            const customersSection = document.getElementById('customersSection');
            const customersTable = customersSection.querySelector('table tbody');

            // Clear existing rows
            customersTable.innerHTML = '';

            // Iterate through the data and create table rows
            data.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${customer.c_no}</td>
                    <td class="border border-gray-300 px-4 py-2">${customer.c_name}</td>
                    <td class="border border-gray-300 px-4 py-2">${customer.c_email}</td>
                    <td class="border border-gray-300 px-4 py-2">${customer.c_cardno}</td>
                `;
                customersTable.appendChild(row);
            });

            // Show the customers section after populating data
            showSection('customersSection');
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Call the function to fetch customers when the page loads
window.addEventListener('load', fetchCustomers);

function mapRoomType(type) {
    switch (type) {
        case 'sup_d':
            return 'Superior Double';
        case 'std_d':
            return 'Standard Double';
        case 'std_t':
            return 'Standard Single';
        case 'sup_t':
            return 'Superior Single';
        default:
            return type; // Return the original type if not matched
    }
}

function mapAvailability(status) {
    switch (status) {
        case 'A':
            return 'Available';
        case 'C':
            return 'Check-out';
        case 'X':
            return 'Unavailable';
        default:
            return 'Unknown';
    }
}
function fetchRooms() {
    fetch('http://localhost:3000/api/rooms/')
        .then((response) => response.json())
        .then((data) => {
            const roomsTable = document.querySelector('#roomsSection table');
            if (roomsTable) {
                // Clear existing table rows
                roomsTable.innerHTML = '';

                // Create table headers
                const headerRow = roomsTable.insertRow();
                const headers = ['Room Number', 'Room Type', 'Availability', 'Action'];
                headers.forEach((header) => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });

                // Loop through the fetched room data and create rows
                data.forEach((room) => {
                    const row = roomsTable.insertRow();
                    row.innerHTML = `
                        <td class="border border-gray-300 px-4 py-2">${room.r_no}</td>
                        <td class="border border-gray-300 px-4 py-2">${mapRoomType(room.r_class)}</td>
                        <td class="border border-gray-300 px-4 py-2">${mapAvailability(room.r_status)}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <select id="roomStatus_${room.r_no}">
                                <option value="A">Available</option>
                                <option value="C">Check-out</option>
                                <option value="X">Unavailable</option>
                                <!-- Add more options if needed -->
                            </select>
                            <button onclick="updateRoomStatus(${room.r_no})" class="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">Update</button>
                        </td>
                    `;
                });
            } else {
                console.error('Rooms table not found.');
            }
        })
        .catch((error) => {
            console.error('Error fetching room data:', error);
        });
}

// Function to update room status
function updateRoomStatus(roomNumber) {
    const newStatus = document.getElementById(`roomStatus_${roomNumber}`).value;

    fetch(`http://localhost:3000/api/updateRoomStatus/${roomNumber}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to update room status');
            }
            // Refresh the room data after successful update
            fetchRooms();
        })
        .catch((error) => {
            console.error('Error updating room status:', error);
        });
}

// Call the function to fetch rooms when the page loads
window.addEventListener('load', fetchRooms);

function fetchBookings() {
    fetch('http://localhost:3000/api/bookings/')
        .then((response) => response.json())
        .then((data) => {
            const bookingsTable = document.querySelector('#bookingsSection table');

            // Clear any existing content in the table
            bookingsTable.innerHTML = '';

            // Create table headers
            const headerRow = bookingsTable.insertRow();
            const headers = ['Booking Ref', 'Customer No', 'Booking Cost', 'Booking Outstanding', 'Booking Notes'];
            headers.forEach((headerText) => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });

            data.forEach((booking) => {
                const row = bookingsTable.insertRow();
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${booking.b_ref}</td>
                    <td class="border border-gray-300 px-4 py-2">${booking.c_no}</td>
                    <td class="border border-gray-300 px-4 py-2">${booking.b_cost}</td>
                    <td class="border border-gray-300 px-4 py-2">${booking.b_outstanding}</td>
                    <td class="border border-gray-300 px-4 py-2">${booking.b_notes}</td>
                `;
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

// Call the function to fetch and display bookings when the page loads
fetchBookings();



    function fetchRoomBookings() {
    fetch('http://localhost:3000/api/roombookings/')
        .then((response) => response.json())
        .then((data) => {
            const roomBookingsTable = document.querySelector('#roomBookingsSection table');

            // Clear any existing content in the table
            roomBookingsTable.innerHTML = '';

            // Create table headers
            const headerRow = roomBookingsTable.insertRow();
            const headers = ['Room No', 'Booking Ref', 'Check-in', 'Check-out'];
            headers.forEach((headerText) => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });

            data.forEach((roomBooking) => {
                const row = roomBookingsTable.insertRow();
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${roomBooking.r_no}</td>
                    <td class="border border-gray-300 px-4 py-2">${roomBooking.b_ref}</td>
                    <td class="border border-gray-300 px-4 py-2">${new Date(roomBooking.checkin).toLocaleDateString()}</td>
                    <td class="border border-gray-300 px-4 py-2">${new Date(roomBooking.checkout).toLocaleDateString()}</td>
                `;
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

// Call the function to fetch and display room bookings when the page loads
fetchRoomBookings();

function fetchRates() {
    fetch('http://localhost:3000/api/rates/')
        .then((response) => response.json())
        .then((data) => {
            const ratesTable = document.querySelector('#ratesSection table');

            // Clear any existing content in the table
            ratesTable.innerHTML = '';

            // Create table headers
            const headerRow = ratesTable.insertRow();
            const headers = ['Room Class', 'Price (per night, USD)'];
            headers.forEach((headerText) => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });

            data.forEach((rate) => {
                const row = ratesTable.insertRow();
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${getClassDisplayName(rate.r_class)}</td>
                    <td class="border border-gray-300 px-4 py-2">${rate.price}</td>
                `;
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

// Function to get the display name for room class
function getClassDisplayName(className) {
    switch (className) {
        case 'std_t':
            return 'Standard Single';
        case 'std_d':
            return 'Standard Double';
        case 'sup_t':
            return 'Superior Single';
        case 'sup_d':
            return 'Superior Double';
        default:
            return className; // If none matches, return the original class name
    }
}

// Call the function to fetch and display rates when the page loads
fetchRates();

// Function to format a date to dd/mm/yy
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
}

// Function to fetch bookings for the current week
function fetchBookingsForCurrentWeek() {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Start of current week (Sunday)
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay())); // End of current week (Saturday)

    const startOfWeekISOString = startOfWeek.toISOString();
    const endOfWeekISOString = endOfWeek.toISOString();

    fetch(`http://localhost:3000/api/roomBookingsForCurrentWeek?start=${startOfWeekISOString}&end=${endOfWeekISOString}`)
        .then((response) => response.json())
        .then((data) => {
            const dashboardSection = document.getElementById('dashboardSection');
            const bookingsTable = document.createElement('table');
            bookingsTable.classList.add('border', 'border-collapse', 'w-full', 'mt-4');

            // Clear existing content
            dashboardSection.innerHTML = '';
            dashboardSection.appendChild(bookingsTable);

            // Create table headers
            const headerRow = bookingsTable.insertRow();
            headerRow.classList.add('bg-gray-200', 'text-gray-700');
            const headers = ['Room Number', 'Booking Reference', 'Check-in', 'Check-out'];
            headers.forEach((headerText) => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.classList.add('border', 'border-gray-300', 'px-4', 'py-2');
                headerRow.appendChild(th);
            });

            // Loop through the fetched bookings and create rows with formatted dates
            data.forEach((booking, index) => {
                const row = bookingsTable.insertRow();
                row.classList.add(index % 2 === 0 ? 'bg-gray-100' : 'bg-white');
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${booking.r_no}</td>
                    <td class="border border-gray-300 px-4 py-2">${booking.b_ref}</td>
                    <td class="border border-gray-300 px-4 py-2">${formatDate(booking.checkin)}</td>
                    <td class="border border-gray-300 px-4 py-2">${formatDate(booking.checkout)}</td>
                `;
            });
        })
        .catch((error) => {
            console.error('Error fetching bookings:', error);
        });
}

// Call the function to fetch and display bookings for the current week when the page loads
window.addEventListener('load', fetchBookingsForCurrentWeek);