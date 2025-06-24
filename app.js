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
        if (!fromDateStr) {
            alert('Please enter a valid start date');
            return; // Exit function if validation fails
        }
        if (isNaN(numberOfMonths) || numberOfMonths < 1 || !Number.isInteger(numberOfMonths)) {
            alert('Please enter number of months');
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
            staffMonthsInput.id = `availableStaffMonths${i}`; // Unique ID for each input field
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
            const availableStaffMonths = parseInt(document.getElementById(`availableStaffMonths${i}`).value, 10); // Retrieve staff months input

            // Define start and end dates for the staff period
            const startDate = new Date(currentDate);
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
            const toDate = new Date(currentDate);

            // Create a staff period object with formatted dates and availability
            const staffPeriod = {
                fromDate: formatDate(startDate),
                toDate: formatDate(toDate),
                available: availableStaffMonths
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

            // Create container and input for epic staff months
            const epicStaffMonthsContainer = document.createElement('div');
            epicStaffMonthsContainer.className = 'col';

            const epicStaffMonthsLabel = document.createElement('label');
            epicStaffMonthsLabel.textContent = `Epic Staff Months`; // Label for staff months
            epicStaffMonthsContainer.appendChild(epicStaffMonthsLabel);

            const epicStaffMonthsInput = document.createElement('input');
            epicStaffMonthsInput.type = 'number'; // Input type for numeric data
            epicStaffMonthsInput.className = 'form-control';
            epicStaffMonthsInput.min = '1'; // Minimum value constraint
            epicStaffMonthsInput.id = `epicStaffMonths${i}`; // Unique ID for each staff months input
            epicStaffMonthsContainer.appendChild(epicStaffMonthsInput);

            // Append all containers to the epic input group
            epicInputGroup.appendChild(epicNameContainer);
            epicInputGroup.appendChild(startDateContainer);
            epicInputGroup.appendChild(epicStaffMonthsContainer);

            // Append the epic input group to the main container
            epicInputsContainer.appendChild(epicInputGroup);
        }
    };

    // Function to generate epic details and calculate their end dates based on staff data
    window.generateEpics = function() {
        const numberOfEpics = document.getElementById('numberOfEpics').value;
        epicTableBody.innerHTML = ''; // Clear previous epic details

        console.log("Number of Epics:", numberOfEpics); 
        for (let i = 0; i < numberOfEpics; i++) {
            const epicName = document.getElementById(`epicName${i}`).value || `Epic ${i + 1}`;
            const epicStartDateStr = document.getElementById(`epicStartDate${i}`).value;
            const epicStaffMonthsInput = document.getElementById(`epicStaffMonths${i}`).value;
            const epicStaffMonths = parseInt(epicStaffMonthsInput, 10);
            console.log("Epic Staff Months:", epicStaffMonths); 

            // Validation: Ensure both start date and staff months are provided and valid
            if (!epicStartDateStr) {
                alert(`Please enter a valid start date for Epic ${i + 1}`);
                return; // Exit function if validation fails
            }
            if (isNaN(epicStaffMonths) || epicStaffMonths < 1 || !Number.isInteger(epicStaffMonths)) {
                alert(`Please enter a valid number of staff months for Epic ${i + 1}`);
                return; // Exit function if validation fails
            }

            const row = document.createElement('tr'); // Create a table row for each epic

            const epicCell = document.createElement('td');
            epicCell.textContent = `Epic ${i + 1}: ${epicName}`; // Display both number and name

            const startDateCell = document.createElement('td');
            startDateCell.textContent = formatDate(new Date(epicStartDateStr)); // Format start date for display

            const epicStaffMonthsCell = document.createElement('td');
            epicStaffMonthsCell.textContent = epicStaffMonths;

            try {
                const endDateCell = document.createElement('td');
                const estimatedEndDate = calculateEndDate(epicStartDateStr, availableStaffData, epicStaffMonths); // Calculate epic end date
                endDateCell.textContent = formatDate(new Date(estimatedEndDate)); // Format end date for display
                row.appendChild(epicCell);
                row.appendChild(startDateCell);
                row.appendChild(epicStaffMonthsCell);
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
    function calculateEndDate(startDateStr, availableStaffData, epicStaffMonths) {
        // Parse the start date string and create a Date object using UTC
        const [year, month, day] = startDateStr.split('-');
        const startDate = new Date(Date.UTC(year, month - 1, day));

        console.log("Epic Start Date (UTC):", formatDate(startDate)); // Log the start date in UTC

        // Sort availableStaffData by fromDate to ensure periods are checked in chronological order
        availableStaffData.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
        console.log("Available Staff Data (sorted):", availableStaffData); // Log sorted available staff data

        let remainingEpicStaffMonths = epicStaffMonths; // Initialize remaining staff months needed to complete the epic
        let currentDate = new Date(startDate); // Start calculation from the epic's start date

        console.log("Remaining Epic Staff Months:", remainingEpicStaffMonths);
        console.log("Current Date (UTC):", formatDate(currentDate)); // Log current date in UTC

        let counter = 0;
        // Loop through each available staff period to calculate the end date
        for (const period of availableStaffData) {
            console.log("counter: ", counter);
            counter++;  
            console.log("Period", period);

            const [periodStartMonth, periodStartDay, periodStartYear] = period.fromDate.split('/');
            const periodStartDate = new Date(Date.UTC(periodStartYear, periodStartMonth - 1, periodStartDay));

            const [periodEndMonth, periodEndDay, periodEndYear] = period.toDate.split('/');
            const periodEndDate = new Date(Date.UTC(periodEndYear, periodEndMonth - 1, periodEndDay));

            console.log("Period Start Date (UTC):", formatDate(periodStartDate));
            console.log("Period End Date (UTC):", formatDate(periodEndDate));

            // Skip staff periods that end before the epic's start date
            if (currentDate > periodEndDate) {
                console.log("Period is being skipped over");
                continue;
            }

            // Align the current date to the start of the period if it's before the period's start
            if (currentDate < periodStartDate) {
                currentDate = new Date(periodStartDate);
            }

            // Calculate the number of full months available in this period
            const monthsInPeriod = (periodEndDate.getUTCFullYear() - currentDate.getUTCFullYear()) * 12 +
                                   (periodEndDate.getUTCMonth() - currentDate.getUTCMonth());

            const staffMonthsAvailable = monthsInPeriod * period.available; // Total staff months available in this period

            console.log("Months In Period:", monthsInPeriod);
            console.log("Staff Months Available:", staffMonthsAvailable);

            // Check if the available staff months can fulfill the remaining staff months needed
            if (remainingEpicStaffMonths <= staffMonthsAvailable) {
                const monthsNeeded = Math.ceil(remainingEpicStaffMonths / period.available);
                currentDate.setUTCMonth(currentDate.getUTCMonth() + monthsNeeded);
                return formatDate(currentDate); // Return the calculated end date in MM/DD/YYYY format
            } else {
                remainingEpicStaffMonths -= staffMonthsAvailable;
                currentDate = new Date(periodEndDate);
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1); // Advance to the start of the next period
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
