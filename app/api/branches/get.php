<?php
require_once '../db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, city, contact_info FROM branches ORDER BY city ASC");
    $branches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $branches]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при получении филиалов: ' . $e->getMessage()]);
}
exit;
