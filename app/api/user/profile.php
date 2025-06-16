<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Неавторизован']);
    http_response_code(401);
    exit;
}

require_once '../db.php';

$stmt = $pdo->prepare("SELECT id, name, email, role, branch_id FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode($user);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Пользователь не найден']);
    http_response_code(404);
}
