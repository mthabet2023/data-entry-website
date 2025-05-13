// Google Sheets API configuration
// Sheet configuration will be handled by the server
const SHEETS = {
    'محمد ثابت': 'Sheet1',
    'محمد شيخون': 'Sheet2'
};

// Initialize date inputs with today's date
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => input.value = today);

    // Add event listeners
    const expenseForm = document.getElementById('expenseForm');
    const editForm = document.getElementById('editForm');
    const filterSelect = document.getElementById('filterResponsible');

    if (expenseForm) {
        expenseForm.addEventListener('submit', handleSubmit);
    }

    if (editForm) {
        editForm.addEventListener('submit', handleEdit);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', loadExpenses);
        // Load initial data
        loadExpenses();
    }
});

async function handleSubmit(e) {
    e.preventDefault();
    
    const responsible = document.getElementById('responsible').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;

    try {
        // Convert date to formatted string
        const formattedDate = new Date(date).toLocaleDateString('ar-EG');
        
        // Prepare the data for Google Sheets
        const data = {
            values: [[formattedDate, description, amount]]
        };

        // Send data to Google Sheets
        await appendToSheet(SHEETS[responsible], data);
        
        // Clear form
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        
        alert('تم إضافة المصروف بنجاح');
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء إضافة المصروف');
    }
}

async function loadExpenses() {
    const responsible = document.getElementById('filterResponsible').value;
    const tbody = document.getElementById('expensesTable');
    const totalElement = document.getElementById('totalAmount');

    try {
        // Fetch data from Google Sheets
        const response = await fetch(`/api/sheets?sheet=${SHEETS[responsible]}`);
        const data = await response.json();

        // Clear existing rows
        tbody.innerHTML = '';
        
        let total = 0;
        
        // Add new rows
        data.values.forEach((row, index) => {
            const [date, description, amount] = row;
            total += parseFloat(amount) || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${date}</td>
                <td>${description}</td>
                <td>${amount}</td>
                <td>
                    <button class="edit-btn" onclick="showEditModal('${index}', '${date}', '${description}', '${amount}')">
                        تعديل
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update total
        totalElement.textContent = total.toFixed(2);
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحميل البيانات');
    }
}

function showEditModal(rowIndex, date, description, amount) {
    const modal = document.getElementById('editModal');
    const dateInput = document.getElementById('editDate');
    const descriptionInput = document.getElementById('editDescription');
    const amountInput = document.getElementById('editAmount');
    const rowIndexInput = document.getElementById('editRowIndex');

    // Convert date format from dd/mm/yyyy to yyyy-mm-dd for input
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    dateInput.value = formattedDate;
    descriptionInput.value = description;
    amountInput.value = amount;
    rowIndexInput.value = rowIndex;

    modal.style.display = 'block';
}

async function handleEdit(e) {
    e.preventDefault();

    const responsible = document.getElementById('filterResponsible').value;
    const rowIndex = document.getElementById('editRowIndex').value;
    const date = document.getElementById('editDate').value;
    const description = document.getElementById('editDescription').value;
    const amount = document.getElementById('editAmount').value;

    try {
        // Convert date to formatted string
        const formattedDate = new Date(date).toLocaleDateString('ar-EG');
        
        // Prepare the data for Google Sheets
        const data = {
            values: [[formattedDate, description, amount]],
            range: `${SHEETS[responsible]}!A${parseInt(rowIndex) + 2}` // +2 because Sheets is 1-based and we have headers
        };

        // Update Google Sheets
        await updateSheet(data);
        
        // Hide modal
        document.getElementById('editModal').style.display = 'none';
        
        // Reload expenses
        await loadExpenses();
        
        alert('تم تحديث المصروف بنجاح');
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحديث المصروف');
    }
}

async function appendToSheet(sheet, data) {
    const response = await fetch(`/api/sheets?sheet=${sheet}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to append data');
    }

    return response.json();
}

async function updateSheet(data) {
    const response = await fetch('/api/sheets', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to update data');
    }

    return response.json();
}
