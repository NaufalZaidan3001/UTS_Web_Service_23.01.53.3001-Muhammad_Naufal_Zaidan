// js/script.js - Hospital Management System Frontend Logic

const API_BASE = 'api.php'; // Assuming api.php is in root directory
let currentUser = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkLoginStatus();
    
    // Setup event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Setup Doctor CRUD
    document.getElementById('doctorForm').addEventListener('submit', saveDoctors);
    
    // Setup Patient CRUD
    document.getElementById('patientForm').addEventListener('submit', savePatients);
    
    // Setup Appointment CRUD
    document.getElementById('appointmentForm').addEventListener('submit', saveAppointments);
    
    // Setup Inpatient CRUD
    document.getElementById('inpatientForm').addEventListener('submit', saveInpatients);
    
    // Setup Prescription CRUD
    document.getElementById('prescriptionForm').addEventListener('submit', savePrescriptions);
    
    // Setup Billing CRUD
    document.getElementById('billingForm').addEventListener('submit', saveBilling);
    
    // Setup Department CRUD
    document.getElementById('departmentForm').addEventListener('submit', saveDepartments);
    
    // Setup Staff CRUD
    document.getElementById('staffForm').addEventListener('submit', saveStaff);
    
    // Setup Medical Record CRUD
    document.getElementById('medicalRecordForm').addEventListener('submit', saveMedicalRecords);
    
    // Setup Medication CRUD
    document.getElementById('medicationForm').addEventListener('submit', saveMedications);
});

// ==================== AUTHENTICATION ====================
function checkLoginStatus() {
    // In a real scenario, we'd check server session
    // For now, check localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
        showDashboard();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('loginMessage');
    
    try {
        const response = await fetch(`auth.php?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMessage(messageDiv, data.message, 'success');
            setTimeout(() => showDashboard(), 1000);
        } else {
            showMessage(messageDiv, data.error, 'error');
        }
    } catch (error) {
        showMessage(messageDiv, 'Connection error: ' + error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const user_type = document.getElementById('userType').value;
    const messageDiv = document.getElementById('registerMessage');
    
    try {
        const response = await fetch(`auth.php?action=register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                username: username,
                email: email,
                password: password,
                user_type: user_type
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(messageDiv, data.message + ' You can now login!', 'success');
            setTimeout(() => showLogin(), 2000);
        } else {
            showMessage(messageDiv, data.error, 'error');
        }
    } catch (error) {
        showMessage(messageDiv, 'Connection error: ' + error.message, 'error');
    }
}

function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    showLogin();
    
    fetch(`auth.php?action=logout`, {
        method: 'POST',
        credentials: 'include'
    });
}

// ==================== PAGE NAVIGATION ====================
function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showRegister() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    
    // Update user display
    if (currentUser) {
        document.getElementById('userDisplay').textContent = `Welcome, ${currentUser.name} (${currentUser.user_type})`;
    }
    
    // Load initial dashboard data
    loadDashboardData();
}

function showSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const sectionId = section + 'Section';
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Load data for the section
    switch(section) {
        case 'doctors':
            loadDoctors();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'inpatients':
            loadInpatients();
            break;
        case 'prescriptions':
            loadPrescriptions();
            break;
        case 'billing':
            loadBilling();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'medical_records':
            loadMedicalRecords();
            break;
        case 'medications':
            loadMedications();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'message ' + type;
    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: error.message };
    }
}

// ==================== DASHBOARD ====================
async function loadDashboardData() {
    // Load stats
    const doctors = await apiCall('doctors');
    const patients = await apiCall('patients');
    const appointments = await apiCall('appointments');
    const inpatients = await apiCall('inpatients');
    
    if (!doctors.error) {
        document.getElementById('totalDoctors').textContent = doctors.length || 0;
    }
    if (!patients.error) {
        document.getElementById('totalPatients').textContent = patients.length || 0;
    }
    if (!appointments.error) {
        const pendingAppointments = appointments.filter(a => a.status === 'Scheduled').length;
        document.getElementById('totalAppointments').textContent = pendingAppointments;
        
        // Load recent appointments
        const recentAppointmentsTable = document.querySelector('#recentAppointmentsTable tbody');
        recentAppointmentsTable.innerHTML = '';
        
        const recent = appointments.slice(0, 5);
        for (const appt of recent) {
            const patientData = patients.find(p => p.patient_id == appt.patient_id);
            const doctorData = doctors.find(d => d.doctor_id == appt.doctor_id);
            
            const row = recentAppointmentsTable.insertRow();
            row.innerHTML = `
                <td>${patientData?.name || 'N/A'}</td>
                <td>${doctorData?.name || 'N/A'}</td>
                <td>${appt.appointment_date}</td>
                <td>${appt.appointment_time}</td>
                <td><span class="status-${appt.status.toLowerCase()}">${appt.status}</span></td>
            `;
        }
    }
    if (!inpatients.error) {
        document.getElementById('totalInpatients').textContent = inpatients.length || 0;
    }
}

// ==================== DOCTORS CRUD ====================
async function loadDoctors() {
    const data = await apiCall('doctors');
    const table = document.querySelector('#doctorsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const doctor of data) {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${doctor.name}</td>
                <td>${doctor.specialization}</td>
                <td>${doctor.license_number}</td>
                <td>${doctor.phone}</td>
                <td>${doctor.email}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editDoctor(${doctor.doctor_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteDoctor(${doctor.doctor_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showDoctorForm() {
    document.getElementById('doctorFormContainer').classList.add('show');
    document.getElementById('doctorFormContainer').classList.remove('hidden');
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorId').value = '';
}

function hideDoctorForm() {
    document.getElementById('doctorFormContainer').classList.remove('show');
    document.getElementById('doctorFormContainer').classList.add('hidden');
}

async function editDoctor(id) {
    const data = await apiCall(`doctors/${id}`);
    if (!data.error && data.length > 0) {
        const doctor = data[0];
        document.getElementById('doctorId').value = doctor.doctor_id;
        document.getElementById('doctorName').value = doctor.name;
        document.getElementById('doctorSpecialization').value = doctor.specialization;
        document.getElementById('doctorLicense').value = doctor.license_number;
        document.getElementById('doctorPhone').value = doctor.phone;
        document.getElementById('doctorEmail').value = doctor.email;
        showDoctorForm();
    }
}

async function saveDoctors(e) {
    e.preventDefault();
    
    const id = document.getElementById('doctorId').value;
    const data = {
        name: document.getElementById('doctorName').value,
        specialization: document.getElementById('doctorSpecialization').value,
        license_number: document.getElementById('doctorLicense').value,
        phone: document.getElementById('doctorPhone').value,
        email: document.getElementById('doctorEmail').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `doctors/${id}` : 'doctors';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideDoctorForm();
        loadDoctors();
        alert('Doctor saved successfully!');
    } else {
        alert('Error saving doctor: ' + (response.error || 'Unknown error'));
    }
}

async function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        const response = await apiCall(`doctors/${id}`, 'DELETE');
        if (response.success) {
            loadDoctors();
            alert('Doctor deleted successfully!');
        } else {
            alert('Error deleting doctor');
        }
    }
}

// ==================== PATIENTS CRUD ====================
async function loadPatients() {
    const data = await apiCall('patients');
    const table = document.querySelector('#patientsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const patient of data) {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.dob}</td>
                <td>${patient.gender}</td>
                <td>${patient.phone}</td>
                <td>${patient.email}</td>
                <td>${patient.address}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editPatient(${patient.patient_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deletePatient(${patient.patient_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showPatientForm() {
    document.getElementById('patientFormContainer').classList.add('show');
    document.getElementById('patientFormContainer').classList.remove('hidden');
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
}

function hidePatientForm() {
    document.getElementById('patientFormContainer').classList.remove('show');
    document.getElementById('patientFormContainer').classList.add('hidden');
}

async function editPatient(id) {
    const data = await apiCall(`patients/${id}`);
    if (!data.error && data.length > 0) {
        const patient = data[0];
        document.getElementById('patientId').value = patient.patient_id;
        document.getElementById('patientName').value = patient.name;
        document.getElementById('patientDob').value = patient.dob;
        document.getElementById('patientGender').value = patient.gender;
        document.getElementById('patientPhone').value = patient.phone;
        document.getElementById('patientEmail').value = patient.email;
        document.getElementById('patientAddress').value = patient.address;
        showPatientForm();
    }
}

async function savePatients(e) {
    e.preventDefault();
    
    const id = document.getElementById('patientId').value;
    const data = {
        name: document.getElementById('patientName').value,
        dob: document.getElementById('patientDob').value,
        gender: document.getElementById('patientGender').value,
        phone: document.getElementById('patientPhone').value,
        email: document.getElementById('patientEmail').value,
        address: document.getElementById('patientAddress').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `patients/${id}` : 'patients';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hidePatientForm();
        loadPatients();
        alert('Patient saved successfully!');
    } else {
        alert('Error saving patient: ' + (response.error || 'Unknown error'));
    }
}

async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        const response = await apiCall(`patients/${id}`, 'DELETE');
        if (response.success) {
            loadPatients();
            alert('Patient deleted successfully!');
        } else {
            alert('Error deleting patient');
        }
    }
}

// ==================== APPOINTMENTS CRUD ====================
async function loadAppointments() {
    const data = await apiCall('appointments');
    const patients = await apiCall('patients');
    const doctors = await apiCall('doctors');
    
    // Update select options
    const patientSelect = document.getElementById('appointmentPatient');
    const doctorSelect = document.getElementById('appointmentDoctor');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    if (!patients.error && Array.isArray(patients)) {
        patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.name;
            patientSelect.appendChild(option);
        });
    }
    
    if (!doctors.error && Array.isArray(doctors)) {
        doctors.forEach(d => {
            const option = document.createElement('option');
            option.value = d.doctor_id;
            option.textContent = d.name;
            doctorSelect.appendChild(option);
        });
    }
    
    const table = document.querySelector('#appointmentsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const appt of data) {
            const patient = patients.find(p => p.patient_id == appt.patient_id);
            const doctor = doctors.find(d => d.doctor_id == appt.doctor_id);
            
            const row = table.insertRow();
            row.innerHTML = `
                <td>${patient?.name || 'N/A'}</td>
                <td>${doctor?.name || 'N/A'}</td>
                <td>${appt.appointment_date}</td>
                <td>${appt.appointment_time}</td>
                <td>${appt.status}</td>
                <td>${appt.reason}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editAppointment(${appt.appointment_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteAppointment(${appt.appointment_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showAppointmentForm() {
    document.getElementById('appointmentFormContainer').classList.add('show');
    document.getElementById('appointmentFormContainer').classList.remove('hidden');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentId').value = '';
}

function hideAppointmentForm() {
    document.getElementById('appointmentFormContainer').classList.remove('show');
    document.getElementById('appointmentFormContainer').classList.add('hidden');
}

async function editAppointment(id) {
    const data = await apiCall(`appointments/${id}`);
    if (!data.error && data.length > 0) {
        const appt = data[0];
        document.getElementById('appointmentId').value = appt.appointment_id;
        document.getElementById('appointmentPatient').value = appt.patient_id;
        document.getElementById('appointmentDoctor').value = appt.doctor_id;
        document.getElementById('appointmentDate').value = appt.appointment_date;
        document.getElementById('appointmentTime').value = appt.appointment_time;
        document.getElementById('appointmentStatus').value = appt.status;
        document.getElementById('appointmentReason').value = appt.reason;
        showAppointmentForm();
    }
}

async function saveAppointments(e) {
    e.preventDefault();
    
    const id = document.getElementById('appointmentId').value;
    const data = {
        patient_id: document.getElementById('appointmentPatient').value,
        doctor_id: document.getElementById('appointmentDoctor').value,
        appointment_date: document.getElementById('appointmentDate').value,
        appointment_time: document.getElementById('appointmentTime').value,
        status: document.getElementById('appointmentStatus').value,
        reason: document.getElementById('appointmentReason').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `appointments/${id}` : 'appointments';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideAppointmentForm();
        loadAppointments();
        alert('Appointment saved successfully!');
    } else {
        alert('Error saving appointment: ' + (response.error || 'Unknown error'));
    }
}

async function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const response = await apiCall(`appointments/${id}`, 'DELETE');
        if (response.success) {
            loadAppointments();
            alert('Appointment deleted successfully!');
        } else {
            alert('Error deleting appointment');
        }
    }
}

// ==================== INPATIENTS CRUD ====================
async function loadInpatients() {
    const data = await apiCall('inpatients');
    const patients = await apiCall('patients');
    const doctors = await apiCall('doctors');
    
    // Update select options
    const patientSelect = document.getElementById('inpatientPatient');
    const doctorSelect = document.getElementById('inpatientDoctor');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    if (!patients.error && Array.isArray(patients)) {
        patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.name;
            patientSelect.appendChild(option);
        });
    }
    
    if (!doctors.error && Array.isArray(doctors)) {
        doctors.forEach(d => {
            const option = document.createElement('option');
            option.value = d.doctor_id;
            option.textContent = d.name;
            doctorSelect.appendChild(option);
        });
    }
    
    const table = document.querySelector('#inpatientsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const inpatient of data) {
            const patient = patients.find(p => p.patient_id == inpatient.patient_id);
            const doctor = doctors.find(d => d.doctor_id == inpatient.doctor_id);
            
            const row = table.insertRow();
            row.innerHTML = `
                <td>${patient?.name || 'N/A'}</td>
                <td>${doctor?.name || 'N/A'}</td>
                <td>${inpatient.admission_date}</td>
                <td>${inpatient.discharge_date || 'N/A'}</td>
                <td>${inpatient.room_number}</td>
                <td>${inpatient.diagnosis}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editInpatient(${inpatient.inpatient_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteInpatient(${inpatient.inpatient_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showInpatientForm() {
    document.getElementById('inpatientFormContainer').classList.add('show');
    document.getElementById('inpatientFormContainer').classList.remove('hidden');
    document.getElementById('inpatientForm').reset();
    document.getElementById('inpatientId').value = '';
}

function hideInpatientForm() {
    document.getElementById('inpatientFormContainer').classList.remove('show');
    document.getElementById('inpatientFormContainer').classList.add('hidden');
}

async function editInpatient(id) {
    const data = await apiCall(`inpatients/${id}`);
    if (!data.error && data.length > 0) {
        const inpatient = data[0];
        document.getElementById('inpatientId').value = inpatient.inpatient_id;
        document.getElementById('inpatientPatient').value = inpatient.patient_id;
        document.getElementById('inpatientDoctor').value = inpatient.doctor_id;
        document.getElementById('inpatientAdmission').value = inpatient.admission_date;
        document.getElementById('inpatientDischarge').value = inpatient.discharge_date;
        document.getElementById('inpatientRoom').value = inpatient.room_number;
        document.getElementById('inpatientDiagnosis').value = inpatient.diagnosis;
        showInpatientForm();
    }
}

async function saveInpatients(e) {
    e.preventDefault();
    
    const id = document.getElementById('inpatientId').value;
    const data = {
        patient_id: document.getElementById('inpatientPatient').value,
        doctor_id: document.getElementById('inpatientDoctor').value,
        admission_date: document.getElementById('inpatientAdmission').value,
        discharge_date: document.getElementById('inpatientDischarge').value,
        room_number: document.getElementById('inpatientRoom').value,
        diagnosis: document.getElementById('inpatientDiagnosis').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `inpatients/${id}` : 'inpatients';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideInpatientForm();
        loadInpatients();
        alert('Inpatient saved successfully!');
    } else {
        alert('Error saving inpatient: ' + (response.error || 'Unknown error'));
    }
}

async function deleteInpatient(id) {
    if (confirm('Are you sure you want to delete this inpatient?')) {
        const response = await apiCall(`inpatients/${id}`, 'DELETE');
        if (response.success) {
            loadInpatients();
            alert('Inpatient deleted successfully!');
        } else {
            alert('Error deleting inpatient');
        }
    }
}

// ==================== PRESCRIPTIONS CRUD ====================
async function loadPrescriptions() {
    const data = await apiCall('prescriptions');
    const patients = await apiCall('patients');
    const doctors = await apiCall('doctors');
    const medications = await apiCall('medications');
    
    // Update select options
    const patientSelect = document.getElementById('prescriptionPatient');
    const doctorSelect = document.getElementById('prescriptionDoctor');
    const medicationSelect = document.getElementById('prescriptionMedication');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    medicationSelect.innerHTML = '<option value="">Select Medication</option>';
    
    if (!patients.error && Array.isArray(patients)) {
        patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.name;
            patientSelect.appendChild(option);
        });
    }
    
    if (!doctors.error && Array.isArray(doctors)) {
        doctors.forEach(d => {
            const option = document.createElement('option');
            option.value = d.doctor_id;
            option.textContent = d.name;
            doctorSelect.appendChild(option);
        });
    }
    
    if (!medications.error && Array.isArray(medications)) {
        medications.forEach(m => {
            const option = document.createElement('option');
            option.value = m.medication_id;
            option.textContent = m.name;
            medicationSelect.appendChild(option);
        });
    }
    
    const table = document.querySelector('#prescriptionsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const prescription of data) {
            const patient = patients.find(p => p.patient_id == prescription.patient_id);
            const doctor = doctors.find(d => d.doctor_id == prescription.doctor_id);
            const medication = medications.find(m => m.medication_id == prescription.medication_id);
            
            const row = table.insertRow();
            row.innerHTML = `
                <td>${patient?.name || 'N/A'}</td>
                <td>${doctor?.name || 'N/A'}</td>
                <td>${medication?.name || 'N/A'}</td>
                <td>${prescription.dosage}</td>
                <td>${prescription.frequency}</td>
                <td>${prescription.duration}</td>
                <td>${prescription.prescription_date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editPrescription(${prescription.prescription_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deletePrescription(${prescription.prescription_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showPrescriptionForm() {
    document.getElementById('prescriptionFormContainer').classList.add('show');
    document.getElementById('prescriptionFormContainer').classList.remove('hidden');
    document.getElementById('prescriptionForm').reset();
    document.getElementById('prescriptionId').value = '';
    document.getElementById('prescriptionDate').valueAsDate = new Date();
}

function hidePrescriptionForm() {
    document.getElementById('prescriptionFormContainer').classList.remove('show');
    document.getElementById('prescriptionFormContainer').classList.add('hidden');
}

async function editPrescription(id) {
    const data = await apiCall(`prescriptions/${id}`);
    if (!data.error && data.length > 0) {
        const prescription = data[0];
        document.getElementById('prescriptionId').value = prescription.prescription_id;
        document.getElementById('prescriptionPatient').value = prescription.patient_id;
        document.getElementById('prescriptionDoctor').value = prescription.doctor_id;
        document.getElementById('prescriptionMedication').value = prescription.medication_id;
        document.getElementById('prescriptionDosage').value = prescription.dosage;
        document.getElementById('prescriptionFrequency').value = prescription.frequency;
        document.getElementById('prescriptionDuration').value = prescription.duration;
        document.getElementById('prescriptionDate').value = prescription.prescription_date;
        showPrescriptionForm();
    }
}

async function savePrescriptions(e) {
    e.preventDefault();
    
    const id = document.getElementById('prescriptionId').value;
    const data = {
        patient_id: document.getElementById('prescriptionPatient').value,
        doctor_id: document.getElementById('prescriptionDoctor').value,
        medication_id: document.getElementById('prescriptionMedication').value,
        dosage: document.getElementById('prescriptionDosage').value,
        frequency: document.getElementById('prescriptionFrequency').value,
        duration: document.getElementById('prescriptionDuration').value,
        prescription_date: document.getElementById('prescriptionDate').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `prescriptions/${id}` : 'prescriptions';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hidePrescriptionForm();
        loadPrescriptions();
        alert('Prescription saved successfully!');
    } else {
        alert('Error saving prescription: ' + (response.error || 'Unknown error'));
    }
}

async function deletePrescription(id) {
    if (confirm('Are you sure you want to delete this prescription?')) {
        const response = await apiCall(`prescriptions/${id}`, 'DELETE');
        if (response.success) {
            loadPrescriptions();
            alert('Prescription deleted successfully!');
        } else {
            alert('Error deleting prescription');
        }
    }
}

// ==================== BILLING CRUD ====================
async function loadBilling() {
    const data = await apiCall('billing');
    const patients = await apiCall('patients');
    const appointments = await apiCall('appointments');
    
    // Update select options
    const patientSelect = document.getElementById('billingPatient');
    const appointmentSelect = document.getElementById('billingAppointment');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    appointmentSelect.innerHTML = '<option value="">Select Appointment</option>';
    
    if (!patients.error && Array.isArray(patients)) {
        patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.name;
            patientSelect.appendChild(option);
        });
    }
    
    if (!appointments.error && Array.isArray(appointments)) {
        appointments.forEach(a => {
            const option = document.createElement('option');
            option.value = a.appointment_id;
            option.textContent = `Appointment #${a.appointment_id}`;
            appointmentSelect.appendChild(option);
        });
    }
    
    const table = document.querySelector('#billingTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const bill of data) {
            const patient = patients.find(p => p.patient_id == bill.patient_id);
            
            const row = table.insertRow();
            row.innerHTML = `
                <td>${patient?.name || 'N/A'}</td>
                <td>Appointment #${bill.appointment_id}</td>
                <td>Rp ${parseFloat(bill.amount).toLocaleString('id-ID')}</td>
                <td>${bill.bill_date}</td>
                <td>${bill.status}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editBilling(${bill.billing_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteBilling(${bill.billing_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showBillingForm() {
    document.getElementById('billingFormContainer').classList.add('show');
    document.getElementById('billingFormContainer').classList.remove('hidden');
    document.getElementById('billingForm').reset();
    document.getElementById('billingId').value = '';
    document.getElementById('billingDate').valueAsDate = new Date();
}

function hideBillingForm() {
    document.getElementById('billingFormContainer').classList.remove('show');
    document.getElementById('billingFormContainer').classList.add('hidden');
}

async function editBilling(id) {
    const data = await apiCall(`billing/${id}`);
    if (!data.error && data.length > 0) {
        const bill = data[0];
        document.getElementById('billingId').value = bill.billing_id;
        document.getElementById('billingPatient').value = bill.patient_id;
        document.getElementById('billingAppointment').value = bill.appointment_id;
        document.getElementById('billingAmount').value = bill.amount;
        document.getElementById('billingDate').value = bill.bill_date;
        document.getElementById('billingStatus').value = bill.status;
        showBillingForm();
    }
}

async function saveBilling(e) {
    e.preventDefault();
    
    const id = document.getElementById('billingId').value;
    const data = {
        patient_id: document.getElementById('billingPatient').value,
        appointment_id: document.getElementById('billingAppointment').value,
        amount: document.getElementById('billingAmount').value,
        bill_date: document.getElementById('billingDate').value,
        status: document.getElementById('billingStatus').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `billing/${id}` : 'billing';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideBillingForm();
        loadBilling();
        alert('Billing saved successfully!');
    } else {
        alert('Error saving billing: ' + (response.error || 'Unknown error'));
    }
}

async function deleteBilling(id) {
    if (confirm('Are you sure you want to delete this billing record?')) {
        const response = await apiCall(`billing/${id}`, 'DELETE');
        if (response.success) {
            loadBilling();
            alert('Billing record deleted successfully!');
        } else {
            alert('Error deleting billing record');
        }
    }
}

// ==================== DEPARTMENTS CRUD ====================
async function loadDepartments() {
    const data = await apiCall('departments');
    const table = document.querySelector('#departmentsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const dept of data) {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${dept.name}</td>
                <td>${dept.description}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editDepartment(${dept.department_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteDepartment(${dept.department_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showDepartmentForm() {
    document.getElementById('departmentFormContainer').classList.add('show');
    document.getElementById('departmentFormContainer').classList.remove('hidden');
    document.getElementById('departmentForm').reset();
    document.getElementById('departmentId').value = '';
}

function hideDepartmentForm() {
    document.getElementById('departmentFormContainer').classList.remove('show');
    document.getElementById('departmentFormContainer').classList.add('hidden');
}

async function editDepartment(id) {
    const data = await apiCall(`departments/${id}`);
    if (!data.error && data.length > 0) {
        const dept = data[0];
        document.getElementById('departmentId').value = dept.department_id;
        document.getElementById('departmentName').value = dept.name;
        document.getElementById('departmentDescription').value = dept.description;
        showDepartmentForm();
    }
}

async function saveDepartments(e) {
    e.preventDefault();
    
    const id = document.getElementById('departmentId').value;
    const data = {
        name: document.getElementById('departmentName').value,
        description: document.getElementById('departmentDescription').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `departments/${id}` : 'departments';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideDepartmentForm();
        loadDepartments();
        alert('Department saved successfully!');
    } else {
        alert('Error saving department: ' + (response.error || 'Unknown error'));
    }
}

async function deleteDepartment(id) {
    if (confirm('Are you sure you want to delete this department?')) {
        const response = await apiCall(`departments/${id}`, 'DELETE');
        if (response.success) {
            loadDepartments();
            alert('Department deleted successfully!');
        } else {
            alert('Error deleting department');
        }
    }
}

// ==================== STAFF CRUD ====================
async function loadStaff() {
    const data = await apiCall('staff');
    const departments = await apiCall('departments');
    
    // Update select options
    const deptSelect = document.getElementById('staffDepartment');
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    
    if (!departments.error && Array.isArray(departments)) {
        departments.forEach(d => {
            const option = document.createElement('option');
            option.value = d.department_id;
            option.textContent = d.name;
            deptSelect.appendChild(option);
        });
    }
    
    const table = document.querySelector('#staffTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const staff of data) {
            const dept = departments.find(d => d.department_id == staff.department_id);
            
            const row = table.insertRow();
            row.innerHTML = `
                <td>${staff.name}</td>
                <td>${staff.position}</td>
                <td>${dept?.name || 'N/A'}</td>
                <td>${staff.phone}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editStaff(${staff.staff_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteStaff(${staff.staff_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showStaffForm() {
    document.getElementById('staffFormContainer').classList.add('show');
    document.getElementById('staffFormContainer').classList.remove('hidden');
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
}

function hideStaffForm() {
    document.getElementById('staffFormContainer').classList.remove('show');
    document.getElementById('staffFormContainer').classList.add('hidden');
}

async function editStaff(id) {
    const data = await apiCall(`staff/${id}`);
    if (!data.error && data.length > 0) {
        const staff = data[0];
        document.getElementById('staffId').value = staff.staff_id;
        document.getElementById('staffName').value = staff.name;
        document.getElementById('staffPosition').value = staff.position;
        document.getElementById('staffDepartment').value = staff.department_id;
        document.getElementById('staffPhone').value = staff.phone;
        showStaffForm();
    }
}

async function saveStaff(e) {
    e.preventDefault();
    
    const id = document.getElementById('staffId').value;
    const data = {
        name: document.getElementById('staffName').value,
        position: document.getElementById('staffPosition').value,
        department_id: document.getElementById('staffDepartment').value,
        phone: document.getElementById('staffPhone').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `staff/${id}` : 'staff';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideStaffForm();
        loadStaff();
        alert('Staff saved successfully!');
    } else {
        alert('Error saving staff: ' + (response.error || 'Unknown error'));
    }
}

async function deleteStaff(id) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        const response = await apiCall(`staff/${id}`, 'DELETE');
        if (response.success) {
            loadStaff();
            alert('Staff member deleted successfully!');
        } else {
            alert('Error deleting staff member');
        }
    }
}

// ==================== MEDICAL RECORDS CRUD ====================
async function loadMedicalRecords() {
    const data = await apiCall('medical_records');
    const patients = await apiCall('patients');
    const doctors = await apiCall('doctors');
    
    // Update select options
    const patientSelect = document.getElementById('medicalRecordPatient');
    const doctorSelect = document.getElementById('medicalRecordDoctor');
    
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    if (!patients.error && Array.isArray(patients)) {
        patients.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.name;
            patientSelect.appendChild(option);
        });
    }
    
    if (!doctors.error && Array.isArray(doctors)) {
        doctors.forEach(d => {
            const option = document.createElement('option');
            option.value = d.doctor_id;
            option.textContent = d.name;
            doctorSelect.appendChild(option);
        });
    }
    
    const table = document.querySelector('#medicalRecordsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const record of data) {
            const patient = patients.find(p => p.patient_id == record.patient_id);
            const doctor = doctors.find(d => d.doctor_id == record.doctor_id);
            
            const row = table.insertRow();
            row.innerHTML = `
                <td>${patient?.name || 'N/A'}</td>
                <td>${doctor?.name || 'N/A'}</td>
                <td>${record.record_date}</td>
                <td>${record.notes}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editMedicalRecord(${record.record_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteMedicalRecord(${record.record_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showMedicalRecordForm() {
    document.getElementById('medicalRecordFormContainer').classList.add('show');
    document.getElementById('medicalRecordFormContainer').classList.remove('hidden');
    document.getElementById('medicalRecordForm').reset();
    document.getElementById('medicalRecordId').value = '';
    document.getElementById('medicalRecordDate').valueAsDate = new Date();
}

function hideMedicalRecordForm() {
    document.getElementById('medicalRecordFormContainer').classList.remove('show');
    document.getElementById('medicalRecordFormContainer').classList.add('hidden');
}

async function editMedicalRecord(id) {
    const data = await apiCall(`medical_records/${id}`);
    if (!data.error && data.length > 0) {
        const record = data[0];
        document.getElementById('medicalRecordId').value = record.record_id;
        document.getElementById('medicalRecordPatient').value = record.patient_id;
        document.getElementById('medicalRecordDoctor').value = record.doctor_id;
        document.getElementById('medicalRecordDate').value = record.record_date;
        document.getElementById('medicalRecordNotes').value = record.notes;
        showMedicalRecordForm();
    }
}

async function saveMedicalRecords(e) {
    e.preventDefault();
    
    const id = document.getElementById('medicalRecordId').value;
    const data = {
        patient_id: document.getElementById('medicalRecordPatient').value,
        doctor_id: document.getElementById('medicalRecordDoctor').value,
        record_date: document.getElementById('medicalRecordDate').value,
        notes: document.getElementById('medicalRecordNotes').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `medical_records/${id}` : 'medical_records';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideMedicalRecordForm();
        loadMedicalRecords();
        alert('Medical record saved successfully!');
    } else {
        alert('Error saving medical record: ' + (response.error || 'Unknown error'));
    }
}

async function deleteMedicalRecord(id) {
    if (confirm('Are you sure you want to delete this medical record?')) {
        const response = await apiCall(`medical_records/${id}`, 'DELETE');
        if (response.success) {
            loadMedicalRecords();
            alert('Medical record deleted successfully!');
        } else {
            alert('Error deleting medical record');
        }
    }
}

// ==================== MEDICATIONS CRUD ====================
async function loadMedications() {
    const data = await apiCall('medications');
    const table = document.querySelector('#medicationsTable tbody');
    table.innerHTML = '';
    
    if (!data.error && Array.isArray(data)) {
        for (const med of data) {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${med.name}</td>
                <td>${med.dosage}</td>
                <td>Rp ${parseFloat(med.price).toLocaleString('id-ID')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editMedication(${med.medication_id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteMedication(${med.medication_id})">Delete</button>
                    </div>
                </td>
            `;
        }
    }
}

function showMedicationForm() {
    document.getElementById('medicationFormContainer').classList.add('show');
    document.getElementById('medicationFormContainer').classList.remove('hidden');
    document.getElementById('medicationForm').reset();
    document.getElementById('medicationId').value = '';
}

function hideMedicationForm() {
    document.getElementById('medicationFormContainer').classList.remove('show');
    document.getElementById('medicationFormContainer').classList.add('hidden');
}

async function editMedication(id) {
    const data = await apiCall(`medications/${id}`);
    if (!data.error && data.length > 0) {
        const med = data[0];
        document.getElementById('medicationId').value = med.medication_id;
        document.getElementById('medicationName').value = med.name;
        document.getElementById('medicationDosage').value = med.dosage;
        document.getElementById('medicationPrice').value = med.price;
        showMedicationForm();
    }
}

async function saveMedications(e) {
    e.preventDefault();
    
    const id = document.getElementById('medicationId').value;
    const data = {
        name: document.getElementById('medicationName').value,
        dosage: document.getElementById('medicationDosage').value,
        price: document.getElementById('medicationPrice').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `medications/${id}` : 'medications';
    
    const response = await apiCall(endpoint, method, data);
    
    if (response.success) {
        hideMedicationForm();
        loadMedications();
        alert('Medication saved successfully!');
    } else {
        alert('Error saving medication: ' + (response.error || 'Unknown error'));
    }
}

async function deleteMedication(id) {
    if (confirm('Are you sure you want to delete this medication?')) {
        const response = await apiCall(`medications/${id}`, 'DELETE');
        if (response.success) {
            loadMedications();
            alert('Medication deleted successfully!');
        } else {
            alert('Error deleting medication');
        }
    }
}