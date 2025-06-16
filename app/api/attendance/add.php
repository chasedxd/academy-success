<?php
require_once '../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$student_id = intval($data['student_id'] ?? 0);
$schedule_id = intval($data['schedule_id'] ?? 0);
$attended = boolval($data['attended'] ?? false);

if ($student_id <= 0 || $schedule_id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO attendance (student_id, schedule_id, attended) VALUES (?, ?, ?)");
    $stmt->execute([$student_id, $schedule_id, $attended]);
    echo json_encode(['status' => 'success', 'message' => 'Посещаемость обновлена']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка: ' . $e->getMessage()]);
}
exit;