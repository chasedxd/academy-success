    <?php
    header('Content-Type: application/json');
    session_start();
    require_once 'db.php';

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['email'], $input['password'])) {
        echo json_encode(['status' => 'error', 'message' => 'Нет email или пароля']);
        exit;
    }

    $email = $input['email'];
    $password = $input['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'Пользователь не найден']);
        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['status' => 'error', 'message' => 'Неверный пароль']);
        exit;
    }

    $_SESSION['user'] = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'branch_id' => $user['branch_id']
    ];

    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);


