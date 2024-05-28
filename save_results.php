<?php
$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['name']) && !empty($data['results'])) {
    $filename = 'results.json';
    if (file_exists($filename)) {
        $current_data = json_decode(file_get_contents($filename), true);
    } else {
        $current_data = [];
    }

    $current_data[] = $data;
    file_put_contents($filename, json_encode($current_data, JSON_PRETTY_PRINT));
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
}
?>
