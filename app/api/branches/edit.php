<?php
require_once '../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$id = intval($data['id'] ?? 0);
$name = trim($data['name'] ?? '');
$city = trim($data['city'] ?? '');
$contact_info = trim($data['contact_info'] ?? '');

if ($id <= 0 || $name === '' || $city === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректные данные: ID, название и город обязательны.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE branches SET name = ?, city = ?, contact_info = ? WHERE id = ?");
    $stmt->execute([$name, $city, $contact_info, $id]);
    echo json_encode(['status' => 'success', 'message' => 'Филиал обновлён успешно']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка при обновлении филиала: ' . $e->getMessage()]);
}
exit;