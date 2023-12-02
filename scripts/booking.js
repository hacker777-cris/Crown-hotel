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


// JavaScript for showing the booking form
document.addEventListener("DOMContentLoaded", function() {
    const showFormStandard = document.getElementById('showFormStandard');
    const showFormSuperior = document.getElementById('showFormSuperior');
    const bookingFormSection = document.getElementById('bookingFormSection');
    const cancelBooking = document.getElementById('cancelBooking');
  
    function showBookingForm() {
      bookingFormSection.classList.remove('hidden');
    }
  
    function hideBookingForm() {
      bookingFormSection.classList.add('hidden');
    }
  
    showFormStandard.addEventListener('click', showBookingForm);
    showFormSuperior.addEventListener('click', showBookingForm);
    cancelBooking.addEventListener('click', hideBookingForm);
  });

  document.addEventListener('DOMContentLoaded', function() {
    // Make a fetch request to fetch rates data from the server
    fetch('http://localhost:3000/api/rates') // Endpoint for rates
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Filter out duplicate entries
        const uniqueRates = [];
        const uniqueClassNames = [];
        data.forEach(rate => {
          if (!uniqueClassNames.includes(rate.r_class)) {
            uniqueClassNames.push(rate.r_class);
            uniqueRates.push(rate);
          }
        });
  
        console.log('Unique Rates:', uniqueRates);
  
        uniqueRates.forEach(rate => {
          const { r_class, price } = rate;
          const elementId = `${r_class}Price`;
          const element = document.getElementById(elementId);
          if (element) {
            element.textContent = `Price: $${price}`;
          } else {
            console.error(`Element with ID ${elementId} not found.`);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching rates:', error);
      });
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

  document.addEventListener('DOMContentLoaded', function() {
    // Make a fetch request to fetch available room data from your server
    fetch('http://localhost:3000/api/rooms') // Endpoint for available rooms
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Handle the retrieved room data here
        console.log('Available Rooms:', data);
  
        // Calculate total available rooms for standard and superior classes (single and double)
        const standardSingleRooms = data.filter(room => room.r_class === 'std_t' && room.r_status === 'A').length;
        const standardDoubleRooms = data.filter(room => room.r_class === 'std_d' && room.r_status === 'A').length;
        const superiorSingleRooms = data.filter(room => room.r_class === 'sup_t' && room.r_status === 'A').length;
        const superiorDoubleRooms = data.filter(room => room.r_class === 'sup_d' && room.r_status === 'A').length;
  
        // Update the total available rooms for each type in the HTML
        document.getElementById('standardSingleAvailable').textContent = 'Standard Single Rooms: ' + standardSingleRooms;
        document.getElementById('standardDoubleAvailable').textContent = 'Standard Double Rooms: ' + standardDoubleRooms;
        document.getElementById('superiorSingleAvailable').textContent = 'Superior Single Rooms: ' + superiorSingleRooms;
        document.getElementById('superiorDoubleAvailable').textContent = 'Superior Double Rooms: ' + superiorDoubleRooms;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  });