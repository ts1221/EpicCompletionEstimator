document.addEventListener('DOMContentLoaded', function() {
    const staffForm = document.getElementById('staff-form');
    const epicTableBody = document.getElementById('epic-table').querySelector('tbody');
    const epicInputsContainer = document.getElementById('epic-inputs');
    const staffList = document.getElementById('staff-list');
    let availableStaffData = [];

   staffForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const staffFromDateStr = document.getElementById('staffFromDate').value;
        const staffToDateStr = document.getElementById('staffToDate').value;
        const staffAvailable = parseInt(document.getElementById('staffAvailable').value, 10);

        // Validate date range before proceeding
        if (!isValidDateRange(staffFromDateStr, staffToDateStr)) {
            return; // Stop processing if the date range is invalid
        }
        const staffPeriod = { fromDate: staffFromDateStr, toDate: staffToDateStr, available: staffAvailable };
        availableStaffData.push(staffPeriod);
        addStaffPeriodToList(staffPeriod);
    });


    

    function addStaffPeriodToList(staffPeriod) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.textContent = `From: ${formatDate(staffPeriod.fromDate)}, To: ${formatDate(staffPeriod.toDate)}, Available Staff: ${staffPeriod.available}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm ml-2';
        deleteButton.onclick = function() {
            const index = availableStaffData.indexOf(staffPeriod);
            if (index > -1) {
                availableStaffData.splice(index, 1);
                staffList.removeChild(listItem);
            }
        };

        listItem.appendChild(deleteButton);
        staffList.appendChild(listItem);
    }

    window.displayEpicInputs = function() {
        const numberOfEpics = document.getElementById('numberOfEpics').value;
        epicInputsContainer.innerHTML = '';

        for (let i = 0; i < numberOfEpics; i++) {
            const epicInputGroup = document.createElement('div');
            epicInputGroup.className = 'form-group';

            const startDateLabel = document.createElement('label');
            startDateLabel.textContent = `Epic ${i + 1} Start Date`;
            const startDateInput = document.createElement('input');
            startDateInput.type = 'date';
            startDateInput.className = 'form-control';
            startDateInput.id = `epicStartDate${i}`;

            const staffMonthsLabel = document.createElement('label');
            staffMonthsLabel.textContent = `Epic ${i + 1} Staff Months`;
            const staffMonthsInput = document.createElement('input');
            staffMonthsInput.type = 'number';
            staffMonthsInput.className = 'form-control';
            staffMonthsInput.min = '1';
            staffMonthsInput.id = `staffMonths${i}`;

            epicInputGroup.appendChild(startDateLabel);
            epicInputGroup.appendChild(startDateInput);
            epicInputGroup.appendChild(staffMonthsLabel);
            epicInputGroup.appendChild(staffMonthsInput);
            epicInputsContainer.appendChild(epicInputGroup);
        }
    };

    window.generateEpics = function() {
        const numberOfEpics = document.getElementById('numberOfEpics').value;
        epicTableBody.innerHTML = '';

        for (let i = 0; i < numberOfEpics; i++) {
            const row = document.createElement('tr');

            const epicCell = document.createElement('td');
            epicCell.textContent = `Epic ${i + 1}`;

            const epicStartDate = document.getElementById(`epicStartDate${i}`).value;

            const startDateCell = document.createElement('td');
            startDateCell.textContent = formatDate(epicStartDate);

            const staffMonthsCell = document.createElement('td');
            const staffMonths = parseInt(document.getElementById(`staffMonths${i}`).value, 10);
            staffMonthsCell.textContent = staffMonths;

            const endDateCell = document.createElement('td');
            const estimatedEndDate = calculateEndDate(epicStartDate, availableStaffData, staffMonths);
            endDateCell.textContent = formatDate(estimatedEndDate);

            row.appendChild(epicCell);
            row.appendChild(startDateCell);
            row.appendChild(staffMonthsCell);
            row.appendChild(endDateCell);
            epicTableBody.appendChild(row);
        }
    };

    function calculateEndDate(startDateStr, availableStaffData, staffMonths) {
        const startDate = new Date(startDateStr);

        // Sort availableStaffData by fromDate to ensure periods are checked in order
        availableStaffData.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

        let remainingStaffMonths = staffMonths;
        let currentDate = startDate;
        
        for (const period of availableStaffData) {
            const periodStartDate = new Date(period.fromDate);
            const periodEndDate = new Date(period.toDate);

            // If the start date is before the current period starts, skip to the period start date
            if (currentDate < periodStartDate) {
                currentDate = periodStartDate;
            }

            // Calculate the number of months available in this period
            const monthsInPeriod = (periodEndDate.getFullYear() - currentDate.getFullYear()) * 12 +
                                (periodEndDate.getMonth() - currentDate.getMonth()) + 1;

            // Calculate staff-months available in this period
            const staffMonthsAvailable = monthsInPeriod * period.available;

            // If remaining staff-months can be fulfilled in this period, calculate the end date
            if (remainingStaffMonths <= staffMonthsAvailable) {
                const monthsNeeded = Math.ceil(remainingStaffMonths / period.available);
                currentDate.setMonth(currentDate.getMonth() + monthsNeeded);
                return currentDate.toISOString().split('T')[0];
            } else {
                // Otherwise, use up all available staff-months in this period and move to the next period
                remainingStaffMonths -= staffMonthsAvailable;
                currentDate = new Date(periodEndDate);
                currentDate.setMonth(currentDate.getMonth() + 1); // Move to the start of the next month
            }
        }

        // If we exhaust all periods and still have remaining staff-months, epic cannot be completed
        throw new Error("Not enough available staff-months to complete the epic within the given periods.");
    }

    function formatDate(dateStr) {
        const dateParts = dateStr.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        return `${month}/${day}/${year}`;
    }

    function isValidDateRange(startDateStr, endDateStr) {
    try {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // Check if the dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Invalid date format. Please provide dates in 'YYYY-MM-DD' format.");
        }

        // Check if the start date is before or equal to the end date
        if (startDate <= endDate) {
            return true;  // Valid date range
        } else {
             throw new Error("Start date must be before or equal to the end date.");
        }
    } catch (error) {
        console.error(error.message);
        alert(error.message);  // Show alert with error message
        return false;
    }
}

    // Periodically check for expired staff periods
    setInterval(function() {
        const now = new Date();
        availableStaffData = availableStaffData.filter(staffPeriod => {
            const toDate = new Date(staffPeriod.toDate);
            if (toDate >= now) {
                return true;
            } else {
                const listItem = Array.from(staffList.children).find(item => item.textContent.includes(formatDate(staffPeriod.toDate)));
                if (listItem) {
                    staffList.removeChild(listItem);
                }
                return false;
            }
        });
    }, 60000); // Check every minute
});
