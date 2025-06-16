<?php
require_once '../db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$branch_id = $data['branch_id'] ?? '';
$role = 'teacher';

if (!$name || !$email || !$password || !$branch_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
    exit;
}

try {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, branch_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword, $role, $branch_id]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка БД: ' . $e->getMessage()]);
}
