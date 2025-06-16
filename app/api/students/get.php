<?php

require_once '../db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT u.id, u.name, u.email, c.name AS course_name, e.grade
                          FROM users u
                          LEFT JOIN enrollments e ON u.id = e.student_id
                          LEFT JOIN courses c ON e.course_id = c.id
                          WHERE u.role = 'student'");
    $students = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'data' => $students]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}