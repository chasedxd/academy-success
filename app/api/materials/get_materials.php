<?php
require '../db.php';
$course_id = $_GET['course_id'];
$stmt = $pdo->prepare("SELECT * FROM course_materials WHERE course_id = ?");
$stmt->execute([$course_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>