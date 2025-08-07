
document.addEventListener('DOMContentLoaded', function() {
    // This event listener ensures that the script runs only after the HTML document is fully loaded.
    // It ensures that all DOM elements are accessible.

    // Cache DOM elements related to staff management for easier access and better performance
    const staffForm = document.getElementById('staff-form'); // Form element for managing staff availability
    const staffInputsContainer = document.getElementById('staff-inputs'); // Container for dynamically generated staff month inputs
    const staffList = document.getElementById('staff-list'); // List element to display staff availability periods
    
    const generateInputsBtn = document.getElementById('generateInputsBtn');
    const updateStaffBtn = document.getElementById('updateStaffBtn');
    const addMonthBtn = document.getElementById('addMonthBtn');

    // Cache DOM elements related to epic management
    const epicTableBody = document.getElementById('epic-table').querySelector('tbody'); // Table body for displaying epic details
    const epicInputsContainer = document.getElementById('epic-inputs'); // Container for dynamically generated epic inputs
    const calculateBtn = document.getElementById('calculateBtn');
    // const addEpicBtn = document.getElementById('addEpicBtn');

    // Added variables to reference the input fields
    const fromDateGroup = document.querySelector('#staffFromDate').closest('.form-group');
    const numberOfMonthsGroup = document.querySelector('#numberOfMonths').closest('.form-group');
    
    // Initialize an array to store periods of available staff data
    let availableStaffData = [];


function getNthMonthDate(startDate, n) {
    const year = startDate.getUTCFullYear();
    const month = startDate.getUTCMonth();
    const day = startDate.getUTCDate();

    const result = new Date(Date.UTC(year, month + n, day));

    if (result.getUTCMonth() !== (month + n) % 12) {
        return new Date(Date.UTC(year, month + n + 1, 0));
    }

    return result;
}

window.generateStaffInputs = function() {
        const fromDateStr = document.getElementById('staffFromDate').value;
        const numberOfMonths = parseFloat(document.getElementById('numberOfMonths').value, 10);

        console.log(numberOfMonths);
        if (!fromDateStr || isNaN(numberOfMonths) || numberOfMonths < 1 || !Number.isInteger(numberOfMonths)) {
            alert('Please enter a valid start date and a whole number for the number of months.');
            return;
        }

        const startDate = new Date(`${fromDateStr}T00:00:00Z`);



        staffInputsContainer.innerHTML = '';

        for (let i = 0; i < numberOfMonths; i++) {

            const targetDate = getNthMonthDate(startDate, i);
            addMonthInput(i, targetDate);
        }

        checkInputs();
    };

    function addMonthInput(monthIndex, currentDate) {
        const monthInputGroup = document.createElement('div');
        monthInputGroup.className = 'form-row align-items-center mb-3';

        const monthLabelContainer = document.createElement('div');
        monthLabelContainer.className = 'col-auto';

        const monthLabel = document.createElement('label');
        monthLabel.textContent = `Month ${monthIndex + 1}: ${formatDate(currentDate)} - Staff Months:`;
        monthLabelContainer.appendChild(monthLabel);

        const staffMonthsInputContainer = document.createElement('div');
        staffMonthsInputContainer.className = 'col-auto d-flex align-items-center'

        // input element 
        const staffMonthsInput = document.createElement('input');
        staffMonthsInput.type = 'number';
        staffMonthsInput.className = 'form-control';
        staffMonthsInput.min = '0';
         staffMonthsInput.step = '0.1';
        staffMonthsInput.id = `availableStaffMonths${monthIndex}`;
        staffMonthsInput.addEventListener('input', checkInputs);


        
        staffMonthsInputContainer.appendChild(staffMonthsInput);

        monthInputGroup.appendChild(monthLabelContainer);
        monthInputGroup.appendChild(staffMonthsInputContainer);
        staffInputsContainer.appendChild(monthInputGroup);
    }

    function getNextMonthDate(date) {

        const newDate = new Date(date);
        newDate.setUTCDate(1); // Start at the first of the month to avoid rolling over
        newDate.setUTCMonth(newDate.getUTCMonth() + 1);
        const daysInMonth = new Date(newDate.getUTCFullYear(), newDate.getUTCMonth() + 1, 0).getUTCDate();
        newDate.setUTCDate(Math.min(date.getUTCDate(), daysInMonth)); // Set to the last valid day
        return newDate;
    }

    function checkInputs() {
        const inputs = document.querySelectorAll('[id^="availableStaffMonths"]');
        const allFieldsFilled = Array.from(inputs).every(input => {
            const value = parseFloat(input.value, 10);
            return !isNaN(value) && value >= 0;
        });

        updateStaffBtn.style.display = allFieldsFilled ? 'inline-block' : 'none';
    }

    staffForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const numberOfMonths = parseInt(document.getElementById('numberOfMonths').value, 10);
        let currentDate = new Date(`${document.getElementById('staffFromDate').value}T00:00:00Z`);

        for (let i = 0; i < numberOfMonths; i++) {
            const availableStaffMonthsInput = document.getElementById(`availableStaffMonths${i}`).value;
            const availableStaffMonths = parseFloat(availableStaffMonthsInput, 10);

            if (isNaN(availableStaffMonths) || availableStaffMonths < 0) {
                alert(`Please enter a valid number of available staff months for Month ${i + 1}`);
                return;
            }

            const startDate = new Date(currentDate);
            currentDate = getNextMonthDate(currentDate);
            const toDate = new Date(currentDate);

            const staffPeriod = {
                fromDate: formatDate(startDate),
                toDate: formatDate(toDate),
                available: availableStaffMonths
            };

            const isDuplicate = availableStaffData.some(period =>
                period.fromDate === staffPeriod.fromDate && period.toDate === staffPeriod.toDate
            );

            if (!isDuplicate) {
                availableStaffData.push(staffPeriod);
                addStaffPeriodToList(staffPeriod);
            } else {
                alert(`A staff period from ${staffPeriod.fromDate} to ${staffPeriod.toDate} already exists.`);
            }
        }

        staffInputsContainer.innerHTML = '';
        fromDateGroup.style.display = 'none';
        numberOfMonthsGroup.style.display = 'none';
        updateStaffBtn.remove();
        generateInputsBtn.style.display = 'none';
        addMonthBtn.style.display = 'inline-block';
        addMonthBtn.style.backgroundColor = '#67c037';
    });

    addMonthBtn.addEventListener('click', function() {
        if (availableStaffData.length > 0) {
            const lastPeriod = availableStaffData[availableStaffData.length - 1];
            currentDate = new Date(lastPeriod.toDate);
        }

        const newMonthIndex = availableStaffData.length;
        addMonthInput(newMonthIndex, currentDate);

        addMonthBtn.disabled = true;

        const staffMonthsInput = document.getElementById(`availableStaffMonths${newMonthIndex}`);
         staffMonthsInput.step = '0.1';  // Ensure decimal input is allowed

        const addMonthConfirmBtn = document.createElement('button');
        addMonthConfirmBtn.textContent = 'Confirm Add Month';
        addMonthConfirmBtn.className = 'btn btn-success mt-2';
        addMonthConfirmBtn.style.backgroundColor = '#67c037';
        addMonthConfirmBtn.addEventListener('click', function() {
            const availableStaffMonths = parseFloat(staffMonthsInput.value, 10);

            if (!isNaN(availableStaffMonths) && availableStaffMonths >= 0) {
                const startDate = new Date(currentDate);
                currentDate = getNextMonthDate(currentDate);
                const toDate = new Date(currentDate);

                const staffPeriod = {
                    fromDate: formatDate(startDate),
                    toDate: formatDate(toDate),
                    available: availableStaffMonths
                };

                availableStaffData.push(staffPeriod);
                addStaffPeriodToList(staffPeriod);

                staffInputsContainer.innerHTML = '';
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


    function checkEpicInputs() {
        const rows = document.querySelectorAll('#epic-inputs .form-row');

        const allFilled = Array.from(rows).every(row => {

            const [name, date, staff] = row.querySelectorAll('input');
            return date.value !== '' && staff.value !== '';
        });

        calculateBtn.style.display = allFilled ? 'inline-block' : 'none';
    }

    window.validateAndDisplayEpics = function () {
        const numEpicsInput = document.getElementById('numberOfEpics');
        const value = parseFloat(numEpicsInput.value, 10);

        console.log(value);
        if (isNaN(value) || value < 1 || !Number.isInteger(value)) {
            alert('Please enter a valid number of epics');
            return;
        }

        displayEpicInputs();

    };

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
            epicNameLabel.textContent = `Epic ${i + 1} Name (Optional)`; // Label for epic name
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
            epicStaffMonthsInput.step = '0.1';
            epicStaffMonthsInput.id = `epicStaffMonths${i}`; // Unique ID for each staff months input
            epicStaffMonthsContainer.appendChild(epicStaffMonthsInput);

            // Append all containers to the epic input group
            epicInputGroup.appendChild(epicNameContainer);
            epicInputGroup.appendChild(startDateContainer);
            epicInputGroup.appendChild(epicStaffMonthsContainer);

            // Append the epic input group to the main container
            epicInputsContainer.appendChild(epicInputGroup);
        }

        const epicInputs = document.querySelectorAll('#epic-inputs input');
        epicInputs.forEach(input => {
            input.addEventListener('input', checkEpicInputs);  
        });

        checkEpicInputs();
    };
window.generateEpics = function() {
    const numberOfEpics = parseInt(document.getElementById('numberOfEpics').value, 10);
    epicTableBody.innerHTML = ''; // Clear previous epic details

    const staffDataCopy = JSON.parse(JSON.stringify(availableStaffData));
    let programEndDate = new Date(0); // Initialize to the earliest possible date

    const epics = []; // Array to store epic details

    // Check for a gap before the first epic
    if (numberOfEpics > 0 && availableStaffData.length > 0) {
        const earliestStaff = availableStaffData.map(p => new Date(p.fromDate)).sort((a, b) => a - b)[0];
        const firstEpicStartDateStr = document.getElementById(`epicStartDate0`).value;
        const firstEpicStart = new Date(`${firstEpicStartDateStr}T00:00:00`);

        if (earliestStaff < firstEpicStart) {
            const gapStartDate = earliestStaff;
            const gapEndDate = new Date(firstEpicStart);
            gapEndDate.setDate(gapEndDate.getDate() - 1);

            const availableMonths = calculateAvailableStaffMonthsInGap(gapStartDate, gapEndDate, availableStaffData);
            if (Math.floor(availableMonths) > 0) {
                const gapRow = document.createElement('tr');
                gapRow.innerHTML = `
                    <td colspan="4" class="text-center custom-gap-color">
                        Gap from ${formatDate(gapStartDate)} to ${formatDate(gapEndDate)}: Available Staff Months: ${Math.floor(availableMonths)}
                    </td>
                `;
                epicTableBody.appendChild(gapRow);
            }
        }
    }

    for (let i = 0; i < numberOfEpics; i++) {
        try {
            const epicName = document.getElementById(`epicName${i}`).value || `Epic ${i + 1}`;
            const epicStartDateStr = document.getElementById(`epicStartDate${i}`).value;

            if (!epicStartDateStr) {
                alert(`Please enter a valid start date for Epic ${i + 1}`);
                return;
            }

            const epicStaffMonthsInput = document.getElementById(`epicStaffMonths${i}`).value;
            const epicStaffMonths = parseFloat(epicStaffMonthsInput, 10);

            if (isNaN(epicStaffMonths) || epicStaffMonths < 0) {
                alert(`Please enter a valid number of staff months for Epic ${i + 1}`);
                return;
            }

            const epicStart = new Date(`${epicStartDateStr}T00:00:00`);
            const estimatedEndDate = calculateEndDate(epicStartDateStr, staffDataCopy, epicStaffMonths);

            epics.push({
                name: epicName,
                startDate: epicStartDateStr,
                endDate: estimatedEndDate
            });

            // Create and append the epic row
            const epicRow = document.createElement('tr');
            epicRow.innerHTML = `
                <td>Epic ${i + 1}: ${epicName}</td>
                <td>${formatDate(new Date(epicStartDateStr))}</td>
                <td>${epicStaffMonths}</td>
                <td>${formatDate(new Date(estimatedEndDate))}</td>
            `;
            epicTableBody.appendChild(epicRow);

            if (i < numberOfEpics - 1) {
                // Check for a gap before adding the next epic
                const nextEpicStartDateStr = document.getElementById(`epicStartDate${i + 1}`).value;
                const nextEpicStart = new Date(`${nextEpicStartDateStr}T00:00:00`);

                if (estimatedEndDate < nextEpicStart) {
                    const gapStartDate = new Date(estimatedEndDate);
                    gapStartDate.setDate(gapStartDate.getDate() + 1); // Start the day after current epic ends
                    const gapEndDate = new Date(nextEpicStart);
                    gapEndDate.setDate(gapEndDate.getDate() - 1); // End the day before next epic starts

                    const availableMonths = calculateAvailableStaffMonthsInGap(gapStartDate, gapEndDate, availableStaffData);
                    if (Math.floor(availableMonths) > 0) {
                        const gapRow = document.createElement('tr');
                        gapRow.innerHTML = `
                            <td colspan="4" class="text-center custom-gap-color">
                                Gap from ${formatDate(gapStartDate)} to ${formatDate(gapEndDate)}: Available Staff Months: ${Math.floor(availableMonths)}
                            </td>
                        `;
                        epicTableBody.appendChild(gapRow);
                    }
                }
            }

            if (estimatedEndDate > programEndDate) {
                programEndDate = estimatedEndDate;
            }
        } catch (error) {
            const errorRow = document.createElement('tr');
            const errorCell = document.createElement('td');
            errorCell.textContent = "Error: " + error.message;
            errorCell.colSpan = 4;
            errorRow.appendChild(errorCell);
            epicTableBody.appendChild(errorRow);
        }
    }

    // Check for a final gap after the last epic
    if (epics.length > 0 && availableStaffData.length > 0) {
        const lastEpicEnd = new Date(epics[epics.length - 1].endDate);
        const lastStaffEnd = new Date(availableStaffData[availableStaffData.length - 1].toDate);

        if (lastEpicEnd < lastStaffEnd) {
            const availableMonths = calculateAvailableStaffMonthsInGap(lastEpicEnd, lastStaffEnd, availableStaffData);
            if (Math.floor(availableMonths) > 0) {
                const finalGapRow = document.createElement('tr');
                finalGapRow.innerHTML = `
                    <td colspan="4" class="text-center custom-gap-color">
                        Gap from ${formatDate(lastEpicEnd)} to ${formatDate(lastStaffEnd)}: Available Staff Months: ${Math.floor(availableMonths)}
                    </td>
                `;
                epicTableBody.appendChild(finalGapRow);
            }
        }
    }

    if (programEndDate.getTime() !== new Date(0).getTime()) {
        document.getElementById('program-end-date').innerHTML = `<strong>Program End Date:</strong> ${formatDate(new Date(programEndDate))}`;
    }
};

function calculateAvailableStaffMonthsInGap(gapStartDate, gapEndDate, availableStaffData) {
    let availableMonths = 0;

    for (let period of availableStaffData) {
        const periodStartDate = new Date(period.fromDate);
        const periodEndDate = new Date(period.toDate);

        // Check if this period overlaps with the gap
        if (gapStartDate <= periodEndDate && gapEndDate >= periodStartDate) {
            const overlapStart = gapStartDate > periodStartDate ? gapStartDate : periodStartDate;
            const overlapEnd = gapEndDate < periodEndDate ? gapEndDate : periodEndDate;

            const overlapDays = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;

            // Calculate days in each month of the overlap
            let daysInMonth = 0;
            let current = new Date(overlapStart);
            while (current <= overlapEnd) {
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
                const endOfMonth = monthEnd < overlapEnd ? monthEnd : overlapEnd;
                daysInMonth = Math.floor((endOfMonth - current) / (1000 * 60 * 60 * 24)) + 1;
                availableMonths += (period.available * daysInMonth) / daysInMonthInMonth(current);
                current.setDate(current.getDate() + daysInMonth);
            }
        }
    }
    return availableMonths;
}
function daysInMonthInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}



    function calculateEndDate(startDateStr, availableStaffData, epicStaffMonths) {
        let currentDate = new Date(startDateStr);
        let epicRemainingStaffMonths = epicStaffMonths;

        console.log("1. Epic Start Date:", formatDate(currentDate));
        console.log("2. Epic Staff Months: ", epicStaffMonths);
        console.log("3. Available Staff Data:", availableStaffData);

        for (let period of availableStaffData) {
            const fromDate = new Date(period.fromDate);
            const toDate = new Date(period.toDate);

            
            // Ensure the current date is at least the start of the period
            if (currentDate < fromDate) {
                currentDate = new Date(fromDate);
            }

            // Calculate the number of days in this period, inclusive
            const periodDays = Math.floor((toDate - currentDate) / (1000 * 60 * 60 * 24)) + 1;

            console.log("4. Period days: ", periodDays);
            console.log("5. available: ", period.available);

            if (periodDays < 0 || period.available <= 0) {
                console.warn("Warning: currentDate is after toDate, skipping period.");
                continue;
            }

            // Calculate the number of staff months this period contributes
            const maxStaffThisPeriod = (period.available * periodDays) / 30; // Approximate a month as 30 days

            console.log("6. Staff Period Availability: ", maxStaffThisPeriod);
            console.log("7. Remaining Staff Months: ", epicRemainingStaffMonths);
            if (maxStaffThisPeriod >= epicRemainingStaffMonths) {
                // Calculate the exact end date within this period
                console.log("GOES INTO IF");
        
                const daysNeeded = (epicRemainingStaffMonths * 30) / period.available;
                period.available -= epicRemainingStaffMonths;
                currentDate.setDate(currentDate.getDate() + Math.ceil(daysNeeded) - 1);
                return currentDate;
            } else {
                console.log("GOES INTO ELSE");
                epicRemainingStaffMonths -= maxStaffThisPeriod;
                currentDate = new Date(toDate);
                currentDate.setDate(currentDate.getDate() + 1); // Advance to the next day after the period end
            }
        }

        throw new Error("Not enough staff months available to complete the epic.");
    }

    window.applyBuffer = function() {
    const bufferPercentage = parseFloat(document.getElementById('bufferPercentage').value) || 0;

    // Retrieve the program end date
    const programEndDateElement = document.getElementById('program-end-date');
    const programEndDateText = programEndDateElement.textContent.match(/(\d{2}\/\d{2}\/\d{4})/);
    
    if (!programEndDateText) {
        alert("Program end date is not calculated yet.");
        return;
    }

    const programEndDate = new Date(programEndDateText[0]);

    // Calculate buffer days and apply to the program end date
    const bufferDays = Math.ceil((bufferPercentage / 100) * (programEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const programEndDateWithBuffer = new Date(programEndDate);
    programEndDateWithBuffer.setDate(programEndDateWithBuffer.getDate() + bufferDays);

    // Update the program end date with buffer display
    document.getElementById('program-end-date-with-buffer').innerHTML = `<strong>Program End Date with Buffer:</strong> ${formatDate(programEndDateWithBuffer)}`;
};

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

