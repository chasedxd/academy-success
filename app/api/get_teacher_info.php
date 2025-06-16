<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    echo json_encode(['status' => 'error', 'message' => 'Нет доступа']);
    exit;
}

$id = $_SESSION['user']['id'];

try {
    $stmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT DISTINCT c.id, c.name
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        WHERE s.teacher_id = ?
    ");
    $stmt->execute([$id]);
    $teacher['courses'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'teacher' => $teacher]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
