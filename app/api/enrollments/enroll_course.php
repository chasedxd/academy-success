<?php
session_start();
header('Content-Type: application/json');
require_once '../db.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode(['status' => 'error', 'message' => 'Нет доступа']);
    exit;
}

$studentId = $_SESSION['user']['id'];
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['course_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Не указан курс']);
    exit;
}

$courseId = intval($input['course_id']);

try {
    $stmt = $pdo->prepare("SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?");
    $stmt->execute([$studentId, $courseId]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Вы уже записаны на этот курс']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)");
    $stmt->execute([$studentId, $courseId]);

    echo json_encode(['status' => 'success', 'message' => 'Вы успешно записались на курс']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
