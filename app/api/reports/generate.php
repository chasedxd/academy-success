<?php
ob_start();
require_once '../db.php';
require_once '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="report_' . ($type ?? 'unknown') . '.xlsx"');
header('Cache-Control: max-age=0');

$type = $_GET['type'] ?? '';

try {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    switch ($type) {
        case 'popularCourses':
            $stmt = $pdo->query("SELECT * FROM popular_courses");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $sheet->setCellValue('A1', 'ID');
            $sheet->setCellValue('B1', 'Название курса');
            $sheet->setCellValue('C1', 'Количество студентов');

            $i = 2;
            foreach ($rows as $row) {
                $sheet->setCellValue("A$i", $row['id'] ?? '');
                $sheet->setCellValue("B$i", $row['name'] ?? '');
                $sheet->setCellValue("C$i", $row['student_count'] ?? 0);
                $i++;
            }
            break;

        case 'branchStats':
            $stmt = $pdo->query("SELECT * FROM branch_stats");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $sheet->setCellValue('A1', 'Город');
            $sheet->setCellValue('B1', 'Количество занятий');
            $sheet->setCellValue('C1', 'Уникальных студентов');

            $i = 2;
            foreach ($rows as $row) {
                $sheet->setCellValue("A$i", $row['city'] ?? '');
                $sheet->setCellValue("B$i", $row['lessons_count'] ?? 0);
                $sheet->setCellValue("C$i", $row['unique_students'] ?? 0);
                $i++;
            }
            break;

        case 'studentPerformance':
            $stmt = $pdo->query("SELECT * FROM student_performance");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $sheet->setCellValue('A1', 'Студент');
            $sheet->setCellValue('B1', 'Курс');
            $sheet->setCellValue('C1', 'Оценка');

            $i = 2;
            foreach ($rows as $row) {
                $sheet->setCellValue("A$i", $row['student_name'] ?? '');
                $sheet->setCellValue("B$i", $row['course_name'] ?? '');
                $sheet->setCellValue("C$i", $row['grade'] ?? 0);
                $i++;
            }
            break;

        case 'financialReport':
            $stmt = $pdo->query("SELECT * FROM financial_report");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $sheet->setCellValue('A1', 'ID');
            $sheet->setCellValue('B1', 'Название курса');
            $sheet->setCellValue('C1', 'Цена');
            $sheet->setCellValue('D1', 'Количество регистраций');
            $sheet->setCellValue('E1', 'Доход');

            $i = 2;
            foreach ($rows as $row) {
                $sheet->setCellValue("A$i", $row['id'] ?? '');
                $sheet->setCellValue("B$i", $row['name'] ?? '');
                $sheet->setCellValue("C$i", $row['price'] ?? 0);
                $sheet->setCellValue("D$i", $row['enrollments'] ?? 0);
                $sheet->setCellValue("E$i", $row['revenue'] ?? 0);
                $i++;
            }
            break;

        case 'registrationDynamics':
            $stmt = $pdo->query("SELECT * FROM registration_dynamics");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $sheet->setCellValue('A1', 'Месяц');
            $sheet->setCellValue('B1', 'Количество регистраций');

            $i = 2;
            foreach ($rows as $row) {
                $sheet->setCellValue("A$i", $row['month'] ?? '');
                $sheet->setCellValue("B$i", $row['registrations'] ?? 0);
                $i++;
            }
            break;

        default:
            http_response_code(400);
            echo "Неверный тип отчета";
            exit;
    }

    ob_end_clean();
    $writer = new Xlsx($spreadsheet);
    $writer->save("php://output");
    exit;

} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo "Ошибка при генерации отчета: " . $e->getMessage();
    exit;
}