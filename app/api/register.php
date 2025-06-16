<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'user'; 
    $branchId = isset($data['branch_id']) ? (int)$data['branch_id'] : 0;

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
        exit;
    }

    if ($role === 'student' && $branchId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Выберите филиал']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email уже зарегистрирован']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    if ($role === 'student') {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $hashedPassword, $role, $branchId]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $hashedPassword, $role]);
    }

    $user = ['id' => $pdo->lastInsertId(), 'name' => $name, 'email' => $email, 'role' => $role];
    echo json_encode(['status' => 'success', 'user' => $user]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
exit;
