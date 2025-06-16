<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode(['status' => 'error', 'message' => 'Пользователь не авторизован']);
    exit;
}

$studentId = $_SESSION['user']['id'];

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['courseId'])) {
    echo json_encode(['status' => 'error', 'message' => 'Неверные входные данные']);
    exit;
}

$courseId = (int)$input['courseId'];

if ($courseId <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Неверный ID курса']);
    exit;
}

$host = 'postgres';
$dbname = 'postgres';
$user = 'user';
$password = 'userpassword';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения к базе данных']);
    exit;
}

$stmt = $pdo->prepare('SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND course_id = ?');
$stmt->execute([$studentId, $courseId]);
if ($stmt->fetchColumn() > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Вы уже записаны на этот курс']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO enrollments (student_id, course_id, grade) VALUES (?, ?, NULL)');
try {
    $stmt->execute([$studentId, $courseId]);
    echo json_encode(['status' => 'success', 'message' => 'Запись на курс прошла успешно']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при записи на курс']);
}
