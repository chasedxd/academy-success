<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode(['status' => 'error', 'message' => 'Нет доступа']);
    exit;
}

$id = $_SESSION['user']['id'];

$stmt = $pdo->prepare("
    SELECT u.name, u.email, b.city AS branch
    FROM users u
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE u.id = ?
");
$stmt->execute([$id]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

$stmt = $pdo->prepare("
    SELECT c.name, e.grade
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
");
$stmt->execute([$id]);
$student['courses'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $pdo->prepare("
    SELECT c.name AS course, s.date_time
    FROM schedules s
    JOIN courses c ON s.course_id = c.id
    WHERE s.branch_id = ?
    ORDER BY s.date_time
");
$stmt->execute([$_SESSION['user']['branch_id']]);
$student['schedule'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'student' => $student]);
