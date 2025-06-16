<?php
require_once '../db.php';
header('Content-Type: application/json');

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Файл не загружен.']);
    exit;
}

$course_id = intval($_POST['course_id'] ?? 0);
if ($course_id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Укажите ID курса']);
    exit;
}

$file = $_FILES['file'];
$fileName = basename($file['name']);
$uploadDir = '../uploads/';
$uploadPath = $uploadDir . uniqid() . '_' . $fileName;

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Не удалось создать директорию для загрузки.']);
    exit;
}

if ($file['size'] > 10000000) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Файл слишком большой (максимум 10MB).']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Недопустимый тип файла. Допустимы: JPEG, PNG, PDF.']);
    exit;
}

if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    try {
        $stmt = $pdo->prepare("INSERT INTO materials (filename, path, upload_date, course_id) VALUES (?, ?, NOW(), ?)");
        $stmt->execute([$fileName, $uploadPath, $course_id]);
        echo json_encode(['status' => 'success', 'message' => 'Файл успешно загружен', 'path' => $uploadPath]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Ошибка при сохранении в базу: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при загрузке файла.']);
}
exit; 