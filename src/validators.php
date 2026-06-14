<?php
// Validierungs-Helfer für eingehende Post-Daten (Titel/Beschreibung/Inhalt + Bild-Upload).
// Werden vom server-controller.php verwendet.

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Bricht den Request ab, wenn PHPs post_max_size überschritten wurde.
 * In dem Fall sind $_POST und $_FILES leer, obwohl der Client Daten geschickt hat.
 * Müssen wir vor der HTTP-Methoden Logik fangen, um eine sprechende Fehlermeldung anzuzeigen.
 */
function rejectIfRequestTooLarge(): void {
    if (
        $_SERVER['REQUEST_METHOD'] === 'POST'
        && empty($_POST)
        && empty($_FILES)
        && isset($_SERVER['CONTENT_LENGTH'])
        && (int)$_SERVER['CONTENT_LENGTH'] > 0
    ) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.']);
        exit;
    }
}

/**
 * Prüft das hochgeladene Bild. Gibt null zurück bei Erfolg / keinem Bild,
 * sonst eine Fehlermeldung als string.
 */
function validateUploadedImage(): ?string {
    if (!isset($_FILES['image'])) {
        return null;
    }
    $file = $_FILES['image'];

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        return 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.';
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return 'Upload fehlgeschlagen (Fehlercode ' . $file['error'] . ').';
    }
    if ($file['size'] > MAX_IMAGE_BYTES) {
        return 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.';
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed)) {
        return 'Ungültiges Bildformat. Erlaubt: ' . implode(', ', $allowed) . '.';
    }
    return null;
}

/**
 * Validiert Titel, Beschreibung, Inhalt und Bild aus $_POST/$_FILES.
 * Bricht den Request mit JSON-Fehler ab, wenn etwas ungültig ist.
 */
function validateInputData(): void
{
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    if ($title === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Ein Titel ist erforderlich."]);
        exit;
    }
    if (mb_strlen($title) > 32) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Titel darf maximal 32 Zeichen lang sein."]);
        exit;
    }
    $description = isset($_POST['description']) ? $_POST['description'] : '';
    if (mb_strlen($description) > 180) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Die Beschreibung darf maximal 180 Zeichen lang sein."]);
        exit;
    }
    $content = isset($_POST['content']) ? $_POST['content'] : '';
    if (mb_strlen($content) > 2000) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Inhalt darf maximal 2000 Zeichen lang sein."]);
        exit;
    }

    $imageError = validateUploadedImage();
    if ($imageError !== null) {
        http_response_code(413);
        echo json_encode(["success" => false, "error" => $imageError]);
        exit;
    }
}
