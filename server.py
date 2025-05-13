from flask import Flask, request, jsonify
from datetime import datetime
import os
import json
import base64
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

app = Flask(__name__)

@app.route('/')
def index():
    current_date = datetime.now().strftime('%Y-%m-%d')
    html = '''
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>تسجيل المصروفات اليومية</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }}
                    .container {{
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }}
                    input {{
                        width: 100%;
                        padding: 8px;
                        margin: 8px 0;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }}
                    button {{
                        width: 100%;
                        padding: 10px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }}
                    button:hover {{
                        background-color: #45a049;
                    }}
                </style>
    </head>
    <body>
        <div class="container">
            <h1>تسجيل المصروفات اليومية</h1>
            <div class="switch-btns">
                <button id="thabetBtn" class="active" onclick="switchPage('thabet')">م. ثابت</button>
                <button id="shekhounBtn" onclick="switchPage('shekhoun')">م. شيخون</button>
            </div>
            <h2 id="pageTitle">صفحة م. ثابت</h2>
            <form id="expenseForm" onsubmit="handleSubmit(event)">
                <input type="date" id="date" name="date" value="{}">".format(current_date)
                <input type="text" id="description" name="description" placeholder="بيان المصروف" required autofocus>
                <input type="number" id="amount" name="amount" placeholder="القيمة" step="0.01" required>
                <input type="hidden" id="person" name="person" value="thabet">
                <button type="submit">إضافة المصروف</button>
            </form>
            <button id="viewDataBtn" onclick="viewData()" style="margin-top:20px;width:100%;background:#ff9800;color:#fff;">عرض وتعديل البيانات</button>
        </div>
        <div class="container" id="dataContainer" style="display:none;"></div>
        <script>
            let currentPage = 'thabet';
            function switchPage(page) {
                currentPage = page;
                document.getElementById('person').value = page;
                document.getElementById('pageTitle').textContent = (page === 'thabet') ? 'صفحة م. ثابت' : 'صفحة م. شيخون';
                document.getElementById('thabetBtn').classList.toggle('active', page === 'thabet');
                document.getElementById('shekhounBtn').classList.toggle('active', page === 'shekhoun');
            }
            function handleSubmit(event) {
                event.preventDefault();
                const formData = new FormData(event.target);
                fetch('/submit', {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(formData)),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(() => {
                    event.target.reset();
                    document.getElementById('description').focus();
                });
            }
            function viewData() {
                document.getElementById('dataContainer').style.display = 'block';
                document.querySelector('.container').style.display = 'none';
                fetch(`/get_data?person=${currentPage}`)
                    .then(res => res.json())
                    .then(data => {
                        let html = `<button onclick="backToForm()" style="margin-bottom:15px;width:100%;background:#2196F3;color:#fff;">رجوع</button>`;
                        html += `<table border='1' style='width:100%;border-collapse:collapse;text-align:center;'>`;
                        html += `<tr><th>تاريخ</th><th>بيان</th><th>القيمة</th><th>تعديل</th></tr>`;
                        data.rows.forEach((row, idx) => {
                            html += `<tr id='row${idx+2}'>` +
                                row.map((cell, cidx) => `<td><span class='cell' data-row='${idx+2}' data-col='${cidx}' contenteditable='false'>${cell}</span></td>`).join('') +
                                `<td><button onclick='editRow(${idx+2})'>تعديل</button> <button style='display:none' onclick='saveRow(${idx+2})' id='save${idx+2}'>حفظ</button></td></tr>`;
                        });
                        html += `</table>`;
                        document.getElementById('dataContainer').innerHTML = html;
                    });
            }
            function backToForm() {
                document.getElementById('dataContainer').style.display = 'none';
                document.querySelector('.container').style.display = 'block';
            }
            function editRow(rowNum) {
                document.querySelectorAll(`#row${rowNum} .cell`).forEach(cell => cell.contentEditable = true);
                document.getElementById(`save${rowNum}`).style.display = 'inline-block';
            }
            function saveRow(rowNum) {
                const cells = document.querySelectorAll(`#row${rowNum} .cell`);
                const values = Array.from(cells).map(cell => cell.textContent);
                fetch('/update_row', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ row: rowNum, values: values, person: currentPage })
                }).then(res => res.json()).then(data => {
                    alert(data.message);
                    document.querySelectorAll(`#row${rowNum} .cell`).forEach(cell => cell.contentEditable = false);
                    document.getElementById(`save${rowNum}`).style.display = 'none';
                });
            }
        </script>
    </body>
    </html>
    '''
    return html


@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    person = data.get('person', 'thabet')
    sheet_name = 'Sheet1' if person == 'thabet' else 'Sheet2'
    creds_json = os.environ.get('GOOGLE_CREDENTIALS')
    if not creds_json:
        return jsonify({'status': 'error', 'message': 'GOOGLE_CREDENTIALS environment variable is not set'}), 400
    creds_bytes = base64.b64decode(creds_json)
    creds_info = json.loads(creds_bytes)
    creds = Credentials.from_service_account_info(
        creds_info,
        scopes=['https://www.googleapis.com/auth/spreadsheets'])
    service = build('sheets', 'v4', credentials=creds)
    spreadsheet_id = '1HsmoQaLpyHDAwAHz6QaR-TieVCWUK54g0f3fF-rY0PQ'
    # التأكد أن القيمة رقم
    try:
        amount = float(data['amount'])
    except Exception:
        return jsonify({'status': 'error', 'message': 'القيمة يجب أن تكون أرقام فقط'}), 400
    values = [[data['date'], data['description'], amount]]
    range_str = f'{sheet_name}!A2:C2'
    result = service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=range_str,
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body={'values': values}
    ).execute()
    return jsonify({'status': 'success', 'message': 'تمت الإضافة بنجاح'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
