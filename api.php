<?php
// api.php - RESTful API with Security Features
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db.php';

// Prevent SQL Injection - Validate and sanitize inputs
function sanitizeInput($data) {
    return htmlspecialchars(stripslashes(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Get request method and path
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$resource = $request_uri[0] ?? '';
$id = $request_uri[1] ?? '';

// Route handler
switch ($resource) {
    case 'doctors':
        handleDoctors($request_method, $id);
        break;
    case 'patients':
        handlePatients($request_method, $id);
        break;
    case 'appointments':
        handleAppointments($request_method, $id);
        break;
    case 'inpatients':
        handleInpatients($request_method, $id);
        break;
    case 'prescriptions':
        handlePrescriptions($request_method, $id);
        break;
    case 'billing':
        handleBilling($request_method, $id);
        break;
    case 'departments':
        handleDepartments($request_method, $id);
        break;
    case 'staff':
        handleStaff($request_method, $id);
        break;
    case 'medical_records':
        handleMedicalRecords($request_method, $id);
        break;
    case 'medications':
        handleMedications($request_method, $id);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found']);
}

// DOCTORS CRUD
function handleDoctors($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM doctors WHERE doctor_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM doctors");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $specialization = sanitizeInput($data['specialization']);
        $license_number = sanitizeInput($data['license_number']);
        $phone = sanitizeInput($data['phone']);
        $email = sanitizeInput($data['email']);
        
        $stmt = $conn->prepare("INSERT INTO doctors (name, specialization, license_number, phone, email) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $specialization, $license_number, $phone, $email);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $specialization = sanitizeInput($data['specialization']);
        $license_number = sanitizeInput($data['license_number']);
        $phone = sanitizeInput($data['phone']);
        $email = sanitizeInput($data['email']);
        
        $stmt = $conn->prepare("UPDATE doctors SET name = ?, specialization = ?, license_number = ?, phone = ?, email = ? WHERE doctor_id = ?");
        $stmt->bind_param("sssssi", $name, $specialization, $license_number, $phone, $email, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM doctors WHERE doctor_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// PATIENTS CRUD
function handlePatients($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM patients WHERE patient_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM patients");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $dob = sanitizeInput($data['dob']);
        $gender = sanitizeInput($data['gender']);
        $phone = sanitizeInput($data['phone']);
        $email = sanitizeInput($data['email']);
        $address = sanitizeInput($data['address']);
        
        $stmt = $conn->prepare("INSERT INTO patients (name, dob, gender, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $name, $dob, $gender, $phone, $email, $address);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $dob = sanitizeInput($data['dob']);
        $gender = sanitizeInput($data['gender']);
        $phone = sanitizeInput($data['phone']);
        $email = sanitizeInput($data['email']);
        $address = sanitizeInput($data['address']);
        
        $stmt = $conn->prepare("UPDATE patients SET name = ?, dob = ?, gender = ?, phone = ?, email = ?, address = ? WHERE patient_id = ?");
        $stmt->bind_param("ssssssi", $name, $dob, $gender, $phone, $email, $address, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM patients WHERE patient_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// APPOINTMENTS CRUD
function handleAppointments($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM appointments WHERE appointment_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM appointments ORDER BY appointment_date DESC");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $appointment_date = sanitizeInput($data['appointment_date']);
        $appointment_time = sanitizeInput($data['appointment_time']);
        $status = sanitizeInput($data['status']);
        $reason = sanitizeInput($data['reason']);
        
        $stmt = $conn->prepare("INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iissss", $patient_id, $doctor_id, $appointment_date, $appointment_time, $status, $reason);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $appointment_date = sanitizeInput($data['appointment_date']);
        $appointment_time = sanitizeInput($data['appointment_time']);
        $status = sanitizeInput($data['status']);
        $reason = sanitizeInput($data['reason']);
        
        $stmt = $conn->prepare("UPDATE appointments SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?, status = ?, reason = ? WHERE appointment_id = ?");
        $stmt->bind_param("iissssi", $patient_id, $doctor_id, $appointment_date, $appointment_time, $status, $reason, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM appointments WHERE appointment_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// INPATIENTS CRUD
function handleInpatients($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM inpatients WHERE inpatient_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM inpatients ORDER BY admission_date DESC");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $admission_date = sanitizeInput($data['admission_date']);
        $discharge_date = sanitizeInput($data['discharge_date']);
        $room_number = sanitizeInput($data['room_number']);
        $diagnosis = sanitizeInput($data['diagnosis']);
        
        $stmt = $conn->prepare("INSERT INTO inpatients (patient_id, doctor_id, admission_date, discharge_date, room_number, diagnosis) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iissss", $patient_id, $doctor_id, $admission_date, $discharge_date, $room_number, $diagnosis);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $admission_date = sanitizeInput($data['admission_date']);
        $discharge_date = sanitizeInput($data['discharge_date']);
        $room_number = sanitizeInput($data['room_number']);
        $diagnosis = sanitizeInput($data['diagnosis']);
        
        $stmt = $conn->prepare("UPDATE inpatients SET patient_id = ?, doctor_id = ?, admission_date = ?, discharge_date = ?, room_number = ?, diagnosis = ? WHERE inpatient_id = ?");
        $stmt->bind_param("iissssi", $patient_id, $doctor_id, $admission_date, $discharge_date, $room_number, $diagnosis, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM inpatients WHERE inpatient_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// PRESCRIPTIONS CRUD
function handlePrescriptions($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM prescriptions WHERE prescription_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM prescriptions ORDER BY prescription_date DESC");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $medication_id = (int)$data['medication_id'];
        $dosage = sanitizeInput($data['dosage']);
        $frequency = sanitizeInput($data['frequency']);
        $duration = sanitizeInput($data['duration']);
        $prescription_date = sanitizeInput($data['prescription_date']);
        
        $stmt = $conn->prepare("INSERT INTO prescriptions (patient_id, doctor_id, medication_id, dosage, frequency, duration, prescription_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiiisss", $patient_id, $doctor_id, $medication_id, $dosage, $frequency, $duration, $prescription_date);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $medication_id = (int)$data['medication_id'];
        $dosage = sanitizeInput($data['dosage']);
        $frequency = sanitizeInput($data['frequency']);
        $duration = sanitizeInput($data['duration']);
        $prescription_date = sanitizeInput($data['prescription_date']);
        
        $stmt = $conn->prepare("UPDATE prescriptions SET patient_id = ?, doctor_id = ?, medication_id = ?, dosage = ?, frequency = ?, duration = ?, prescription_date = ? WHERE prescription_id = ?");
        $stmt->bind_param("iiiisssi", $patient_id, $doctor_id, $medication_id, $dosage, $frequency, $duration, $prescription_date, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM prescriptions WHERE prescription_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// BILLING CRUD
function handleBilling($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM billing WHERE billing_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM billing ORDER BY bill_date DESC");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $appointment_id = (int)$data['appointment_id'];
        $amount = (float)$data['amount'];
        $bill_date = sanitizeInput($data['bill_date']);
        $status = sanitizeInput($data['status']);
        
        $stmt = $conn->prepare("INSERT INTO billing (patient_id, appointment_id, amount, bill_date, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iidss", $patient_id, $appointment_id, $amount, $bill_date, $status);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $appointment_id = (int)$data['appointment_id'];
        $amount = (float)$data['amount'];
        $bill_date = sanitizeInput($data['bill_date']);
        $status = sanitizeInput($data['status']);
        
        $stmt = $conn->prepare("UPDATE billing SET patient_id = ?, appointment_id = ?, amount = ?, bill_date = ?, status = ? WHERE billing_id = ?");
        $stmt->bind_param("iidss i", $patient_id, $appointment_id, $amount, $bill_date, $status, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM billing WHERE billing_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// DEPARTMENTS CRUD
function handleDepartments($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM departments WHERE department_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM departments");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $description = sanitizeInput($data['description']);
        
        $stmt = $conn->prepare("INSERT INTO departments (name, description) VALUES (?, ?)");
        $stmt->bind_param("ss", $name, $description);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $description = sanitizeInput($data['description']);
        
        $stmt = $conn->prepare("UPDATE departments SET name = ?, description = ? WHERE department_id = ?");
        $stmt->bind_param("ssi", $name, $description, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM departments WHERE department_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// STAFF CRUD
function handleStaff($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM staff WHERE staff_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM staff");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $position = sanitizeInput($data['position']);
        $department_id = (int)$data['department_id'];
        $phone = sanitizeInput($data['phone']);
        
        $stmt = $conn->prepare("INSERT INTO staff (name, position, department_id, phone) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssis", $name, $position, $department_id, $phone);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $position = sanitizeInput($data['position']);
        $department_id = (int)$data['department_id'];
        $phone = sanitizeInput($data['phone']);
        
        $stmt = $conn->prepare("UPDATE staff SET name = ?, position = ?, department_id = ?, phone = ? WHERE staff_id = ?");
        $stmt->bind_param("ssis i", $name, $position, $department_id, $phone, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM staff WHERE staff_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// MEDICAL RECORDS CRUD
function handleMedicalRecords($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM medical_records WHERE record_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM medical_records ORDER BY record_date DESC");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $record_date = sanitizeInput($data['record_date']);
        $notes = sanitizeInput($data['notes']);
        
        $stmt = $conn->prepare("INSERT INTO medical_records (patient_id, doctor_id, record_date, notes) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiss", $patient_id, $doctor_id, $record_date, $notes);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $patient_id = (int)$data['patient_id'];
        $doctor_id = (int)$data['doctor_id'];
        $record_date = sanitizeInput($data['record_date']);
        $notes = sanitizeInput($data['notes']);
        
        $stmt = $conn->prepare("UPDATE medical_records SET patient_id = ?, doctor_id = ?, record_date = ?, notes = ? WHERE record_id = ?");
        $stmt->bind_param("iissi", $patient_id, $doctor_id, $record_date, $notes, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM medical_records WHERE record_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

// MEDICATIONS CRUD
function handleMedications($method, $id) {
    global $conn;
    
    if ($method === 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM medications WHERE medication_id = ?");
            $stmt->bind_param("i", $id);
        } else {
            $result = $conn->query("SELECT * FROM medications");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $dosage = sanitizeInput($data['dosage']);
        $price = (float)$data['price'];
        
        $stmt = $conn->prepare("INSERT INTO medications (name, dosage, price) VALUES (?, ?, ?)");
        $stmt->bind_param("ssd", $name, $dosage, $price);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = sanitizeInput($data['name']);
        $dosage = sanitizeInput($data['dosage']);
        $price = (float)$data['price'];
        
        $stmt = $conn->prepare("UPDATE medications SET name = ?, dosage = ?, price = ? WHERE medication_id = ?");
        $stmt->bind_param("ssdi", $name, $dosage, $price, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    } elseif ($method === 'DELETE') {
        $stmt = $conn->prepare("DELETE FROM medications WHERE medication_id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $stmt->error]);
        }
    }
}

?>