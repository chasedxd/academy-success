<?php
require_once 'db.php'; 
header('Content-Type: application/json');

$teacherId = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : 0;

if ($teacherId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Неверный ID преподавателя']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, name FROM courses WHERE teacher_id = ?");
    $stmt->execute([$teacherId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'courses' => $courses]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка БД: ' . $e->getMessage()]);
}
