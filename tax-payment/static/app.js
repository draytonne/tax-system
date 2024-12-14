// static/scripts.js

document.addEventListener('DOMContentLoaded', function () {
    // Dynamically populate the dropdown with due dates
    populateDueDateDropdown();

    // Add event listener for the due date dropdown to filter results
    const dueDateDropdown = document.querySelector('select[name="due_date"]');
    dueDateDropdown.addEventListener('change', handleFilterByDueDate);

    // Function to populate the dropdown dynamically
    function populateDueDateDropdown() {
        const currentYear = new Date().getFullYear();
        const dueDates = ['04/15', '06/15', '09/15', '01/15'];

        const dropdowns = document.querySelectorAll('select[name="due_date"]');
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = ''; // Clear existing options

            dueDates.forEach(date => {
                const year = date === '01/15' ? currentYear + 1 : currentYear;
                const optionValue = `${year}-${date}`;
                const optionText = `${date}/${year}`;

                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionText;

                dropdown.appendChild(option);
            });
        });
    }

    // Function to fetch and display filtered results
    function handleFilterByDueDate(event) {
        const selectedDueDate = event.target.value;

        fetch(`/filter?due_date=${selectedDueDate}`)
            .then(response => response.json())
            .then(data => updateTable(data))
            .catch(error => console.error('Error fetching filtered data:', error));
    }

    // Function to update the table dynamically
    function updateTable(data) {
        const table = document.querySelector('table');
        let totalAmount = 0;

        // Start building the table content
        let tableContent = `
            <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Due Date</th>
            </tr>
        `;

        if (data.length === 0) {
            // If no data, show an empty table with a message
            tableContent += `
                <tr>
                    <td colspan="6">No records found for this due date.</td>
                </tr>
            `;
        } else {
            // Add rows dynamically for each record
            data.forEach(row => {
                totalAmount += parseFloat(row[2]); // Accumulate total amount

                tableContent += `
                    <tr>
                        <td>${row[0]}</td>
                        <td>${row[1]}</td>
                        <td>${parseFloat(row[2]).toFixed(2)}</td>
                        <td>${row[3] || 'N/A'}</td>
                        <td>${row[4]}</td>
                        <td>${row[5]}</td>
                    </tr>
                `;
            });

            // Append total amount row
            tableContent += `
                <tr>
                    <td colspan="6" style="text-align: right;">
                        <strong>Total Amount: $${totalAmount.toFixed(2)}</strong>
                    </td>
                </tr>
            `;
        }

        // Update the table with new content
        table.innerHTML = tableContent;
    }
});
