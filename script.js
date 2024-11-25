let students = JSON.parse(localStorage.getItem('students')) || [];
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
let currentStudent = null; // Store current logged-in student globally

// Minimum attendance percentage requirement (e.g., 75%)
const minAttendance = 75;

// Login Logic
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === '1234') {
        showAdminDashboard();
    } else {
        const student = students.find(s => s.username === username && s.password === password);
        if (student) {
            currentStudent = student;  // Track logged-in student
            showStudentDashboard(student);
        } else {
            alert('Invalid login');
        }
    }
});

// Admin Dashboard
function showAdminDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadStudentOptions();
    displayStats();
}

// Add Student
document.getElementById('add-student-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('new-student-name').value;
    const username = document.getElementById('new-student-username').value;
    const password = document.getElementById('new-student-password').value;
    
    students.push({ name, username, password });
    saveData();
    loadStudentOptions();
    alert('Student added successfully');
});

// Load students in dropdown
function loadStudentOptions() {
    const selectStudent = document.getElementById('select-student');
    selectStudent.innerHTML = '';
    students.forEach((student, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = student.name;
        selectStudent.appendChild(option);
    });
}

// Attendance Management
document.getElementById('attendance-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const studentIndex = document.getElementById('select-student').value;
    const date = document.getElementById('attendance-date').value;
    const status = document.getElementById('attendance-status').value;

    attendanceData.push({ ...students[studentIndex], date, status });
    saveData();
    alert('Attendance recorded');
    displayStats();
});

// Display Stats for Admin
function displayStats() {
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = '';
    students.forEach(student => {
        const studentRecords = attendanceData.filter(a => a.username === student.username);
        const percentage = calculatePercentage(studentRecords);
        const statusColor = percentage < minAttendance ? 'red' : 'green';
        statsDiv.innerHTML += `
            <p>${student.name}: <span style="color:${statusColor}">${percentage}%</span></p>`;
    });
}

// Calculate attendance percentage
function calculatePercentage(records) {
    if (records.length === 0) return 0;
    const presentDays = records.filter(r => r.status === 'Present').length;
    return ((presentDays / records.length) * 100).toFixed(2);
}

// Student Dashboard
function showStudentDashboard(student) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('student-dashboard').style.display = 'block';
    document.getElementById('student-name').textContent = student.name;

    // Filter attendance records for this student
    const studentRecords = attendanceData.filter(a => a.username === student.username);
    const tbody = document.getElementById('student-attendance-body');
    tbody.innerHTML = '';
    
    studentRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${record.date}</td><td>${record.status}</td>`;
        tbody.appendChild(row);
    });

    // Display attendance percentage
    const percentage = calculatePercentage(studentRecords);
    document.getElementById('attendance-percentage').textContent = `${percentage}%`;

    // Color the percentage based on threshold
    document.getElementById('attendance-percentage').style.color = percentage < minAttendance ? 'red' : 'green';
}

// Download Excel
function downloadExcel(isStudent = false, studentUsername = null) {
    const wb = XLSX.utils.book_new();
    const header = [["Name", "Date", "Status", "Attendance %"]];
    let records = attendanceData;

    if (isStudent) {
        records = attendanceData.filter(a => a.username === studentUsername);
    }

    const wsData = [
        ...header,
        ...records.map(record => [
            record.name,
            record.date,
            record.status,
            `${calculatePercentage(records)}%`
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, isStudent ? "My Attendance" : "All Attendance");
    XLSX.writeFile(wb, isStudent ? 'my_attendance.xlsx' : 'all_attendance.xlsx');
}

// Logout Function
function logout() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('student-dashboard').style.display = 'none';
    currentStudent = null;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}
