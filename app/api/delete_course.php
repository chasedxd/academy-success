<?php
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

$host = 'postgres';
$dbname = 'postgres';
$user = 'user';
$password = 'userpassword';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$sql = "SELECT id FROM courses WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$sql = "DELETE FROM courses WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    http_response_code(200);
    echo json_encode(['message' => 'Course deleted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete course: No rows affected']);
}

$stmt->close();
$conn->close();
?>