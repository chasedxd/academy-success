<?php
require_once '../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$student_id = intval($data['student_id'] ?? 0);
$course_id = intval($data['course_id'] ?? 0);

if ($student_id <= 0 || $course_id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)");
    $stmt->execute([$student_id, $course_id]);
    echo json_encode(['status' => 'success', 'message' => 'Студент записан на курс']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при записи: ' . $e->getMessage()]);
}
exit;