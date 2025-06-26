document.addEventListener('DOMContentLoaded', function() {
    // This event listener ensures that the script runs only after the HTML document is fully loaded.
    // It ensures that all DOM elements are accessible.

    // Cache DOM elements related to staff management for easier access and better performance
    const staffForm = document.getElementById('staff-form'); // Form element for managing staff availability
    const staffInputsContainer = document.getElementById('staff-inputs'); // Container for dynamically generated staff month inputs
    const staffList = document.getElementById('staff-list'); // List element to display staff availability periods

    const addMonthBtn = document.getElementById('addMonthBtn');

    // Cache DOM elements related to epic management
    const epicTableBody = document.getElementById('epic-table').querySelector('tbody'); // Table body for displaying epic details
    const epicInputsContainer = document.getElementById('epic-inputs'); // Container for dynamically generated epic inputs

    // Added variables to reference the input fields
    const fromDateGroup = document.querySelector('#staffFromDate').closest('.form-group');
    const numberOfMonthsGroup = document.querySelector('#numberOfMonths').closest('.form-group');
    
    // Initialize an array to store periods of available staff data
    let availableStaffData = [];


    window.generateStaffInputs = function() {
        const fromDateStr = document.getElementById('staffFromDate').value;
        const numberOfMonths = parseInt(document.getElementById('numberOfMonths').value, 10);

        if (!fromDateStr || isNaN(numberOfMonths) || numberOfMonths < 1) {
            alert('Please enter a valid start date and number of months.');
            return;
        }

        currentDate = new Date(`${fromDateStr}T00:00:00Z`);
        staffInputsContainer.innerHTML = '';

        for (let i = 0; i < numberOfMonths; i++) {
            addMonthInput(i);
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
        }

        checkInputs(); // Initial check to set the update button visibility
    };

    function addMonthInput(monthIndex) {
        const monthInputGroup = document.createElement('div');
        monthInputGroup.className = 'form-row align-items-center mb-3';

        const monthLabelContainer = document.createElement('div');
        monthLabelContainer.className = 'col-auto';

        const monthLabel = document.createElement('label');
        monthLabel.textContent = `Month ${monthIndex + 1}: ${formatDate(currentDate)}`;
        monthLabelContainer.appendChild(monthLabel);

        const staffMonthsInputContainer = document.createElement('div');
        staffMonthsInputContainer.className = 'col';

        const staffMonthsInput = document.createElement('input');
        staffMonthsInput.type = 'number';
        staffMonthsInput.className = 'form-control';
        staffMonthsInput.min = '0';
        staffMonthsInput.id = `availableStaffMonths${monthIndex}`;
        staffMonthsInput.addEventListener('input', checkInputs); // Check inputs on change
        staffMonthsInputContainer.appendChild(staffMonthsInput);

        monthInputGroup.appendChild(monthLabelContainer);
        monthInputGroup.appendChild(staffMonthsInputContainer);
        staffInputsContainer.appendChild(monthInputGroup);
    }

    function checkInputs() {
        const inputs = document.querySelectorAll('[id^="availableStaffMonths"]');
        const allFieldsFilled = Array.from(inputs).every(input => {
            const value = parseInt(input.value, 10);
            return !isNaN(value) && value >= 0;
        });

        updateStaffBtn.style.display = allFieldsFilled ? 'inline-block' : 'none';
    }

    staffForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const numberOfMonths = parseInt(document.getElementById('numberOfMonths').value, 10);
        currentDate = new Date(`${document.getElementById('staffFromDate').value}T00:00:00Z`);

        for (let i = 0; i < numberOfMonths; i++) {
            const availableStaffMonthsInput = document.getElementById(`availableStaffMonths${i}`).value;
            const availableStaffMonths = parseInt(availableStaffMonthsInput, 10);

            if (isNaN(availableStaffMonths) || availableStaffMonths < 0) {
                alert(`Please enter a valid number of available staff months for Month ${i + 1}`);
                return;
            }

            const startDate = new Date(currentDate);
            currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
            const toDate = new Date(currentDate);

            const staffPeriod = {
                fromDate: formatDate(startDate),
                toDate: formatDate(toDate),
                available: availableStaffMonths
            };

            const isDuplicate = availableStaffData.some(period =>
                period.fromDate === staffPeriod.fromDate &&
                period.toDate === staffPeriod.toDate
            );

            if (!isDuplicate) {
                availableStaffData.push(staffPeriod);
                addStaffPeriodToList(staffPeriod);
            } else {
                alert(`A staff period from ${staffPeriod.fromDate} to ${staffPeriod.toDate} already exists.`);
            }
        }

        // Clear the input fields after updating the staff data
        staffInputsContainer.innerHTML = '';

        // Hide the start date and number of months input groups
        fromDateGroup.style.display = 'none';
        numberOfMonthsGroup.style.display = 'none';

        // Hide the update button
        updateStaffBtn.remove();

        // Ensure the generate inputs button doesn't reappear
        generateInputsBtn.style.display = 'none';

        // Show the add month button
        addMonthBtn.style.display = 'inline-block';
    });

    addMonthBtn.addEventListener('click', function() {
        if (availableStaffData.length > 0) {
            const lastPeriod = availableStaffData[availableStaffData.length - 1];
            currentDate = new Date(lastPeriod.toDate);
        }

        const newMonthIndex = availableStaffData.length;
        addMonthInput(newMonthIndex);

        // Disable the add month button until the current month is confirmed
        addMonthBtn.disabled = true;

        const staffMonthsInput = document.getElementById(`availableStaffMonths${newMonthIndex}`);
        const addMonthConfirmBtn = document.createElement('button');
        addMonthConfirmBtn.textContent = 'Confirm Add Month';
        addMonthConfirmBtn.className = 'btn btn-success mt-2';
        addMonthConfirmBtn.addEventListener('click', function() {
            const availableStaffMonths = parseInt(staffMonthsInput.value, 10);

            if (!isNaN(availableStaffMonths) && availableStaffMonths >= 0) {
                const startDate = new Date(currentDate);
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
                const toDate = new Date(currentDate);

                const staffPeriod = {
                    fromDate: formatDate(startDate),
                    toDate: formatDate(toDate),
                    available: availableStaffMonths
                };

                availableStaffData.push(staffPeriod);
                addStaffPeriodToList(staffPeriod);

                // Clear the new month input after adding
                staffInputsContainer.innerHTML = '';

                // Re-enable the add month button after confirming
                addMonthBtn.disabled = false;
            } else {
                alert('Please enter a valid number of available staff months.');
            }
        });

        staffInputsContainer.appendChild(addMonthConfirmBtn);
    });

    function addStaffPeriodToList(staffPeriod) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `From: ${staffPeriod.fromDate}, To: ${staffPeriod.toDate}, Available Staff: ${staffPeriod.available}`;
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
