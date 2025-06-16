<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../db.php';

try {
    $sql = "SELECT id, name, description, price FROM courses";
    $stmt = $pdo->query($sql);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $courses]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>