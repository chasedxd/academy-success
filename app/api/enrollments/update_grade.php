<?php
require_once '../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$student_id = intval($data['student_id'] ?? 0);
$course_id = intval($data['course_id'] ?? 0);
$grade = floatval($data['grade'] ?? 0);

if ($student_id <= 0 || $course_id <= 0 || $grade < 0 || $grade > 100) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректные данные']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE enrollments SET grade = ? WHERE student_id = ? AND course_id = ?");
    $stmt->execute([$grade, $student_id, $course_id]);
    echo json_encode(['status' => 'success', 'message' => 'Оценка обновлена']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при обновлении: ' . $e->getMessage()]);
}
exit;