const toggleButton = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const sections = {
    'dashboard': document.getElementById('dashboardSection'),
    'customers': document.getElementById('customersSection'),
    'rooms': document.getElementById('roomsSection'),
    'rates': document.getElementById('ratesSection'),
    'bookings': document.getElementById('bookingsSection'),
    'roomBookings': document.getElementById('roomBookingsSection'),
    'bookrooms': document.getElementById('bookingFormSection')
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

//Bookings
// Initialize date pickers for check-in and check-out
flatpickr("#checkin", {
    dateFormat: "Y-m-d",
    minDate: "today",
    onChange: function(selectedDates, dateStr) {
      // Set the minimum date for check-out as the selected check-in date
      flatpickr("#checkout", {
        dateFormat: "Y-m-d",
        minDate: dateStr,
      });
    }
  });


  document.getElementById('cardNo').addEventListener('input', function() {
    const cardNumber = this.value.trim().replace(/\s/g, ''); // Remove spaces from input

    let cardType = '';
    console.log(cardNumber)

    if (/^4\d{15}$/.test(cardNumber)) {
      cardType = 'V';
    } else if (/^5[1-5]\d{14}$/.test(cardNumber)) {
      cardType = 'Mc';
    } else if (/^3[47]\d{13}$/.test(cardNumber)) {
      cardType = 'A';
    } else {
      cardType = 'Unknown';
    }

    document.getElementById('cardType').value = cardType; // Set the card type input value
  });

  document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('submitBooking');

    submitBtn.addEventListener('click', function () {
      const selectedRoomNo = document.getElementById('availableRoomsDropdown').value;

      fetch(`http://localhost:3000/api/roomDetails?r_no=${selectedRoomNo}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch room details');
          }
          return response.json();
        })
        .then((roomDetails) => {
          const roomClass = roomDetails.roomClass
          const classMappings = {
            'superior double': 'sup_d',
            'superior single': 'sup_t',
            'standard double': 'std_d',
            'standard single': 'std_t',
            // Add mappings for other room types and classes as needed
          };

          const roomRatesEndpoint = `http://localhost:3000/api/rates/${roomClass}`;

          fetch(roomRatesEndpoint)
            .then((response) => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then((roomCostData) => {
              const nameInput = document.getElementById('name');
              const emailInput = document.getElementById('email');
              const addressInput = document.getElementById('address');
              const cardType = document.getElementById('cardType').value;
              const cardExp = document.getElementById('cardExp').value;
              const cardNo = document.getElementById('cardNo').value;
              const checkin = document.getElementById('checkin').value;
              const checkout = document.getElementById('checkout').value;
              const phone = document.getElementById('phone').value;

              const name = nameInput.value;
              const email = emailInput.value;
              const address = addressInput.value;

              const roomCost = roomCostData.price; // Assuming the response has a 'price' field

              // Prepare the data to send to the server with the retrieved room cost
              const bookingData = {
                email: email,
                r_no: selectedRoomNo,
                checkIn: checkin,
                checkOut: checkout,
                cost: roomCost, // Use the retrieved room cost
                outstanding: 0,
                notes: `Phone: ${phone}`,
                customerData: {
                  name: name,
                  address: address,
                  cardType: cardType,
                  cardExp: cardExp,
                  cardNo: cardNo,
                },
              };

              fetch('http://localhost:3000/api/bookRoom', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  return response.json();
                })
                .then((data) => {
                  const successMessageSection = document.getElementById('successMessage');
                  successMessageSection.classList.remove('hidden');

                  // Retrieve booking details after successful booking creation
                  fetchBookingDetails(selectedRoomNo, name, email, address);
                })
                .catch((error) => {
                  console.error('There was a problem with the booking:', error);
                  // Optionally, show an error message to the user
                });
            })
            .catch((error) => {
              console.error('Error fetching room cost:', error);
              // Optionally, handle error scenario or show an error message
            });
        })
        .catch((error) => {
          console.error('Error fetching room details:', error);
          // Optionally, handle error scenario or show an error message
        });
    });
    function fetchBookingDetails(roomNumber) {
        const bookingRequestData = { r_no: roomNumber };
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const address = document.getElementById('address');
  
        fetch('http://localhost:3000/api/bookingDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingRequestData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((bookingDetails) => {
            const bookingDetailsSection = document.getElementById('bookingDetails');
            const printableBookingDetails = document.getElementById('printableBookingDetails');
  
            bookingDetailsSection.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Booking Details for Room ${roomNumber}</h2>
            <p><strong>Name:</strong> ${name.value}</p>
            <p><strong>Email:</strong> ${email.value}</p>
            <p><strong>Address:</strong> ${address.value}</p>
            <p><strong>Check-In:</strong> ${bookingDetails[0]?.checkin}</p>
            <p><strong>Check-Out:</strong> ${bookingDetails[0]?.checkout}</p>
            <!-- Include other relevant booking details -->
          `;
  
          printableBookingDetails.classList.remove('hidden');
  
  const printButton = document.getElementById('printButton');
  printButton.addEventListener('click', function () {
    const printableArea = document.getElementById('printableBookingDetails').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Printable Booking Details</title>
          <style>
            /* Include any necessary styles for printing */
            /* For example, hide the print button in the printout */
            #printButton {
              display: none;
            }
          </style>
        </head>
        <body>${printableArea}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  });
  })
  .catch((error) => {
  console.error('Error fetching booking details:', error);
  // Handle error scenario or show an error message
  });
  }
});


// fetch available rooms for dropdown based on room type
const roomTypeDropdown = document.getElementById('roomType');
const availableRoomsDiv = document.getElementById('availableRooms');
const availableRoomsDropdown = document.getElementById('availableRoomsDropdown');

roomTypeDropdown.addEventListener('change', () => {
  const selectedRoomType = roomTypeDropdown.value;

  fetch(`http://localhost:3000/api/rooms`)
    .then(response => response.json())
    .then(data => {
      const filteredRooms = data.filter(room => {
        if (selectedRoomType === 'standard') {
          return room.r_class.includes('std');
        } else if (selectedRoomType === 'superior') {
          return room.r_class.includes('sup');
        }
        return false;
      });

      availableRoomsDropdown.innerHTML = ''; // Clear previous options

      if (filteredRooms.length > 0) {
        filteredRooms.forEach(room => {
          const option = document.createElement('option');
          option.value = room.r_no;
          const roomType = room.r_class.includes('_t') ? 'Single' : 'Double';
          option.text = `Room ${room.r_no} (${roomType})`; // Display whether it's Single or Double
          availableRoomsDropdown.appendChild(option);
        });

        availableRoomsDiv.style.display = 'block'; // Show the available rooms dropdown
      } else {
        availableRoomsDiv.style.display = 'none'; // Hide if no available rooms
      }
    })
    .catch(error => console.error('Error fetching available rooms:', error));
});