<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Доступ запрещён']);
    exit;
}


echo json_encode(['status' => 'success', 'message' => 'Добро пожаловать, админ!']);
?>
