<?php
require_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing id parameter']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Course not found']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
    $stmt->execute([$id]);
    error_log("Delete query executed for course id: $id, affected rows: " . $stmt->rowCount());

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Course deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete course: No rows affected']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete course: ' . $e->getMessage()]);
}
?>