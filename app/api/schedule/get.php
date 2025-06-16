<?php

require_once '../db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT s.id, c.name AS course, u.name AS teacher, b.city AS branch, s.date_time
                          FROM schedules s
                          JOIN courses c ON s.course_id = c.id
                          LEFT JOIN users u ON s.teacher_id = u.id
                          LEFT JOIN branches b ON s.branch_id = b.id
                          ORDER BY s.date_time");
    $schedule = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'data' => $schedule]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}