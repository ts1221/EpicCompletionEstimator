document.addEventListener('DOMContentLoaded', function() {
    // This event listener ensures that the script runs only after the HTML document is fully loaded.
    // It ensures that all DOM elements are accessible.

    // Cache DOM elements related to staff management for easier access and better performance
    const staffForm = document.getElementById('staff-form'); // Form element for managing staff availability
    const staffInputsContainer = document.getElementById('staff-inputs'); // Container for dynamically generated staff month inputs
    const staffList = document.getElementById('staff-list'); // List element to display staff availability periods

    // Cache DOM elements related to epic management
    const epicTableBody = document.getElementById('epic-table').querySelector('tbody'); // Table body for displaying epic details
    const epicInputsContainer = document.getElementById('epic-inputs'); // Container for dynamically generated epic inputs

    // Initialize an array to store periods of available staff data
    let availableStaffData = [];

    // Function to generate dynamic input fields for staff months based on user input
    window.generateStaffInputs = function() {
        // Retrieve the 'From Date' input value and parse 'Number of Months'
        const fromDateStr = document.getElementById('staffFromDate').value;
        const numberOfMonths = parseInt(document.getElementById('numberOfMonths').value, 10);

        // Clear any existing input fields in the container
        staffInputsContainer.innerHTML = '';

        // Validation: Ensure both inputs are valid before proceeding
        if (!fromDateStr || isNaN(numberOfMonths) || numberOfMonths < 1) {
            alert('Please enter a valid from date and number of months.');
            return; // Exit function if validation fails
        }

        // Create a Date object starting at the 'From Date' provided by the user
        let currentDate = new Date(`${fromDateStr}T00:00:00Z`);

        // Loop through each month to generate corresponding input fields
        for (let i = 0; i < numberOfMonths; i++) {
            // Create a container for the input group
            const monthInputGroup = document.createElement('div');
            monthInputGroup.className = 'form-row align-items-center mb-3'; // Use Bootstrap classes for styling

            // Create a label container and label for the current month
            const monthLabelContainer = document.createElement('div');
            monthLabelContainer.className = 'col-auto'; // Bootstrap class for auto-sizing

            const monthLabel = document.createElement('label');
            monthLabel.textContent = `Month ${i + 1}: ${formatDate(currentDate)}`; // Display month number and date
            monthLabelContainer.appendChild(monthLabel);

            // Create an input container for the staff months input
            const staffMonthsInputContainer = document.createElement('div');
            staffMonthsInputContainer.className = 'col'; // Bootstrap class to fill remaining space

            const staffMonthsInput = document.createElement('input');
            staffMonthsInput.type = 'number'; // Input type for numeric data
            staffMonthsInput.className = 'form-control'; // Bootstrap class for styling
            staffMonthsInput.min = '0'; // Minimum value constraint
            staffMonthsInput.id = `staffMonths${i}`; // Unique ID for each input field
            staffMonthsInputContainer.appendChild(staffMonthsInput);

            // Append label and input containers to the input group
            monthInputGroup.appendChild(monthLabelContainer);
            monthInputGroup.appendChild(staffMonthsInputContainer);

            // Append the entire input group to the main container
            staffInputsContainer.appendChild(monthInputGroup);

            // Move to the next month for subsequent iteration
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
        }
    };

    // Event listener for staff form submission to update staff availability data
    staffForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        // Retrieve and parse input values again for processing
        const fromDateStr = document.getElementById('staffFromDate').value;
        const numberOfMonths = parseInt(document.getElementById('numberOfMonths').value, 10);

        let currentDate = new Date(`${fromDateStr}T00:00:00Z`);

        // Loop through each month to process inputs and update data
        for (let i = 0; i < numberOfMonths; i++) {
            const staffMonths = parseInt(document.getElementById(`staffMonths${i}`).value, 10); // Retrieve staff months input

            // Define start and end dates for the staff period
            const startDate = new Date(currentDate);
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
            const toDate = new Date(currentDate);

            // Create a staff period object with formatted dates and availability
            const staffPeriod = {
                fromDate: formatDate(startDate),
                toDate: formatDate(toDate),
                available: staffMonths
            };

            // Add staff period to the data array
            availableStaffData.push(staffPeriod);

            // Add staff period to the display list
            addStaffPeriodToList(staffPeriod);
        }
    });

    // Function to add a staff period to the list display with deletion capability
    function addStaffPeriodToList(staffPeriod) {
        // Create a list item element
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item'; // Bootstrap styling class
        listItem.textContent = `From: ${staffPeriod.fromDate}, To: ${staffPeriod.toDate}, Available Staff: ${staffPeriod.available}`;

        // Create a delete button for removing the staff period
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete'; // Button label
        deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap styling class for small red button
        deleteButton.onclick = function() {
            // Find and remove the staff period from the data array
            const index = availableStaffData.indexOf(staffPeriod);
            if (index > -1) {
                availableStaffData.splice(index, 1);
                staffList.removeChild(listItem); // Remove the list item from the display
            }
        };

        // Append delete button to the list item
        listItem.appendChild(deleteButton);

        // Append the list item to the staff list
        staffList.appendChild(listItem);
    }

    // Function to generate dynamic input fields for epics based on user input
    window.displayEpicInputs = function() {
        const numberOfEpics = document.getElementById('numberOfEpics').value;
        epicInputsContainer.innerHTML = ''; // Clear previous epic inputs

        // Loop through each epic to generate input fields
        for (let i = 0; i < numberOfEpics; i++) {
            const epicInputGroup = document.createElement('div');
            epicInputGroup.className = 'form-row align-items-center mb-3'; // Use Bootstrap classes for styling

            // Create container and input for epic name
            const epicNameContainer = document.createElement('div');
            epicNameContainer.className = 'col-auto';

            const epicNameLabel = document.createElement('label');
            epicNameLabel.textContent = `Epic ${i + 1} Name`; // Label for epic name
            epicNameContainer.appendChild(epicNameLabel);

            const epicNameInput = document.createElement('input');
            epicNameInput.type = 'text'; // Input type for text data
            epicNameInput.className = 'form-control';
            epicNameInput.id = `epicName${i}`; // Unique ID for each epic name input
            epicNameContainer.appendChild(epicNameInput);

            // Create container and input for start date
            const startDateContainer = document.createElement('div');
            startDateContainer.className = 'col-auto';

            const startDateLabel = document.createElement('label');
            startDateLabel.textContent = `Start Date`; // Label for start date
            startDateContainer.appendChild(startDateLabel);

            const startDateInput = document.createElement('input');
            startDateInput.type = 'date'; // Input type for date data
            startDateInput.className = 'form-control';
            startDateInput.id = `epicStartDate${i}`; // Unique ID for each start date input
            startDateContainer.appendChild(startDateInput);

            // Create container and input for staff months
            const staffMonthsContainer = document.createElement('div');
            staffMonthsContainer.className = 'col';

            const staffMonthsLabel = document.createElement('label');
            staffMonthsLabel.textContent = `Staff Months`; // Label for staff months
            staffMonthsContainer.appendChild(staffMonthsLabel);

            const staffMonthsInput = document.createElement('input');
            staffMonthsInput.type = 'number'; // Input type for numeric data
            staffMonthsInput.className = 'form-control';
            staffMonthsInput.min = '1'; // Minimum value constraint
            staffMonthsInput.id = `staffMonths${i}`; // Unique ID for each staff months input
            staffMonthsContainer.appendChild(staffMonthsInput);

            // Append all containers to the epic input group
            epicInputGroup.appendChild(epicNameContainer);
            epicInputGroup.appendChild(startDateContainer);
            epicInputGroup.appendChild(staffMonthsContainer);

            // Append the epic input group to the main container
            epicInputsContainer.appendChild(epicInputGroup);
        }
    };

    // Function to generate epic details and calculate their end dates based on staff data
    window.generateEpics = function() {
        const numberOfEpics = document.getElementById('numberOfEpics').value;
        epicTableBody.innerHTML = ''; // Clear previous epic details

        // Loop through each epic to process details and calculate end dates
        for (let i = 0; i < numberOfEpics; i++) {
            const row = document.createElement('tr'); // Create a table row for each epic

            // Retrieve epic name and number, defaulting to 'Epic X' if no name is provided
            const epicName = document.getElementById(`epicName${i}`).value || `Epic ${i + 1}`;
            
            const epicCell = document.createElement('td');
            epicCell.textContent = `Epic ${i + 1}: ${epicName}`; // Display both number and name

            const epicStartDateStr = document.getElementById(`epicStartDate${i}`).value;
            const epicStartDate = new Date(epicStartDateStr); // Convert start date string to Date object

            const startDateCell = document.createElement('td');
            startDateCell.textContent = formatDate(epicStartDate); // Format start date for display

            const staffMonthsCell = document.createElement('td');
            const staffMonths = parseInt(document.getElementById(`staffMonths${i}`).value, 10); // Parse staff months input
            staffMonthsCell.textContent = staffMonths;

            try {
                const endDateCell = document.createElement('td');
                const estimatedEndDate = calculateEndDate(epicStartDateStr, availableStaffData, staffMonths); // Calculate epic end date
                endDateCell.textContent = formatDate(new Date(estimatedEndDate)); // Format end date for display
                row.appendChild(epicCell);
                row.appendChild(startDateCell);
                row.appendChild(staffMonthsCell);
                row.appendChild(endDateCell);
            } catch (error) {
                const errorCell = document.createElement('td');
                errorCell.textContent = "Error: " + error.message; // Display error message if calculation fails
                errorCell.colSpan = 4; // Span across all columns
                row.appendChild(errorCell);
            }

            epicTableBody.appendChild(row); // Append the row to the table body
        }
    };

    // Function to calculate the end date for an epic based on available staff data
    function calculateEndDate(startDateStr, availableStaffData, staffMonths) {
        const startDate = new Date(startDateStr); // Convert start date string to Date object

        // Sort availableStaffData by fromDate to ensure periods are checked in chronological order
        availableStaffData.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

        let remainingStaffMonths = staffMonths; // Initialize remaining staff months needed to complete the epic
        let currentDate = startDate; // Start calculation from the epic's start date
        
        // Loop through each available staff period to calculate the end date
        for (const period of availableStaffData) {
            const periodStartDate = new Date(period.fromDate); // Start date of the current staff period
            const periodEndDate = new Date(period.toDate); // End date of the current staff period

            // Skip staff periods that end before the epic's start date
            if (currentDate > periodEndDate) {
                continue;
            }

            // Align the current date to the start of the period if it's before the period's start
            if (currentDate < periodStartDate) {
                currentDate = periodStartDate;
            }

            // Calculate the number of full months available in this period
            const monthsInPeriod = (periodEndDate.getFullYear() - currentDate.getFullYear()) * 12 +
                                   (periodEndDate.getMonth() - currentDate.getMonth());

            const staffMonthsAvailable = monthsInPeriod * period.available; // Total staff months available in this period

            // Check if the available staff months can fulfill the remaining staff months needed
            if (remainingStaffMonths <= staffMonthsAvailable) {
                const monthsNeeded = Math.ceil(remainingStaffMonths / period.available); // Calculate months needed to complete the epic
                currentDate.setMonth(currentDate.getMonth() + monthsNeeded); // Advance the current date by the months needed
                return currentDate.toISOString().split('T')[0]; // Return the calculated end date in YYYY-MM-DD format
            } else {
                remainingStaffMonths -= staffMonthsAvailable; // Deduct used staff months from remaining
                currentDate = new Date(periodEndDate); // Move current date to the end of the period
                currentDate.setMonth(currentDate.getMonth() + 1); // Advance to the start of the next period
            }
        }

        // Throw an error if the epic cannot be completed within the given staff periods
        throw new Error("Not enough available staff-months to complete the epic within the given periods.");
    }

    // Function to format a date object into a string in MM/DD/YYYY format
    function formatDate(date) {
        // Convert string to Date object if necessary
        if (typeof date === 'string') {
            date = new Date(date);
        }

        // Validate the date object
        if (!(date instanceof Date) || isNaN(date)) {
            console.error('Invalid date:', date); // Log error for debugging
            return ''; // Return empty string for invalid dates
        }

        // Format date components into MM/DD/YYYY format
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Ensure month is two digits
        const day = String(date.getUTCDate()).padStart(2, '0'); // Ensure day is two digits
        return `${month}/${day}/${year}`; // Concatenate formatted date string
    }
});
