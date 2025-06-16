<?php

require_once '../db.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? '';

    if (!$id || !$name || !$description || !$price) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE courses SET name = ?, description = ?, price = ? WHERE id = ?");
    $stmt->execute([$name, $description, $price, $id]);

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
exit;