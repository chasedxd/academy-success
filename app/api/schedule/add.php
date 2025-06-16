<?php
require_once '../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$course_id = intval($data['course_id'] ?? 0);
$branch_id = intval($data['branch_id'] ?? 0);
$teacher_id = intval($data['teacher_id'] ?? 0);
$date_time = $data['date_time'] ?? '';

if ($course_id <= 0 || $branch_id <= 0 || $teacher_id <= 0 || $date_time === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Все поля обязательны']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM schedules WHERE teacher_id = ? AND date_time = ?");
    $stmt->execute([$teacher_id, $date_time]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Преподаватель занят в это время']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO schedules (course_id, branch_id, teacher_id, date_time) VALUES (?, ?, ?, ?)");
    $stmt->execute([$course_id, $branch_id, $teacher_id, $date_time]);
    echo json_encode(['status' => 'success', 'message' => 'Занятие добавлено в расписание']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
exit;