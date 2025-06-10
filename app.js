function estimateCompletion() {
    const staffMonths = parseFloat(document.getElementById('staffMonths').value);
    const staffAvailable = parseFloat(document.getElementById('staffAvailable').value);

    if (isNaN(staffMonths) || isNaN(staffAvailable) || staffAvailable <= 0) {
        alert("Please enter valid numbers for both fields.");
        return;
    }

    const monthsRequired = staffMonths / staffAvailable;
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + Math.ceil(monthsRequired));

    const completionDate = currentDate.toDateString();
    document.getElementById('completionDate').textContent = completionDate;
}
