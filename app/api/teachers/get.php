<?php

header('Content-Type: application/json; charset=utf-8');
require_once '../db.php';

try {
    $sql = "SELECT id, name, email FROM users WHERE role = 'teacher'";
    $stmt = $pdo->query($sql);
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $teachers]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>