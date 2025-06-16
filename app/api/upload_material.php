<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    echo json_encode(['status' => 'error', 'message' => 'Нет доступа']);
    exit;
}

if (!isset($_FILES['material']) || !isset($_POST['course_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Данные не переданы']);
    exit;
}

$course_id = (int)$_POST['course_id'];
$file = $_FILES['material'];

$upload_dir = __DIR__ . '/../uploads/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'];
if (!in_array($file['type'], $allowed_types)) {
    echo json_encode(['status' => 'error', 'message' => 'Недопустимый тип файла']);
    exit;
}

$maxSize = 10 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    echo json_encode(['status' => 'error', 'message' => 'Файл слишком большой']);
    exit;
}

$filename = uniqid() . '_' . basename($file['name']);
$path = $upload_dir . $filename;

if (move_uploaded_file($file['tmp_name'], $path)) {

    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Не удалось загрузить файл']);
}
