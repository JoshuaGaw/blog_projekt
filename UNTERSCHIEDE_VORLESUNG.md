# Unterschiede zwischen Vorlesung und Projekt-Umsetzung

> Dieses Dokument erklärt die bewussten Abweichungen vom Vorlesungsstoff und warum sie gewählt wurden.
> Nutze es als Vorbereitung für die Präsentation am 23.06.2026.

---

## 1. `fetch()` statt `XMLHttpRequest`

### Was der Dozent gelehrt hat (XMLHttpRequest)

```
┌─────────────┐         ┌──────────────────────────────────────┐         ┌─────────────┐
│   Browser    │         │         XMLHttpRequest-Code          │         │   Server    │
│  (Button-    │────────▶│                                      │────────▶│  (PHP)      │
│   Klick)     │         │  var xmlhttp = new XMLHttpRequest(); │         │             │
│              │         │  xmlhttp.onreadystatechange = ...    │         │  ajax.php   │
│              │◀────────│  if (readyState==4 && status==200)   │◀────────│  echo ...   │
│  innerHTML   │         │  xmlhttp.open("GET","ajax.php",true) │         │             │
│  = response  │         │  xmlhttp.send();                     │         │             │
└─────────────┘         └──────────────────────────────────────┘         └─────────────┘
```

**Ablauf:**
1. Button-Klick löst JS-Funktion aus
2. `XMLHttpRequest`-Objekt wird erstellt
3. `onreadystatechange`-Callback wird definiert
4. Request wird mit `.open()` konfiguriert und mit `.send()` abgeschickt
5. Callback prüft `readyState == 4` (fertig) und `status == 200` (OK)
6. `responseText` wird per `innerHTML` ins DOM geschrieben

### Was ich verwende (fetch API)

```
┌─────────────┐         ┌──────────────────────────────────────┐         ┌─────────────┐
│   Browser    │         │            fetch()-Code              │         │   Server    │
│  (Button-    │────────▶│                                      │────────▶│  (PHP)      │
│   Klick)     │         │  fetch("posts.php")                  │         │             │
│              │         │    .then(response => response.json()) │         │  posts.php  │
│              │◀────────│    .then(data => { ... })             │◀────────│  echo JSON  │
│  DOM-Update  │         │                                      │         │             │
└─────────────┘         └──────────────────────────────────────┘         └─────────────┘
```

**Ablauf:**
1. Button-Klick löst JS-Funktion aus
2. `fetch()` sendet den Request und gibt ein **Promise** zurück
3. Erster `.then()`: Antwort wird als JSON geparst
4. Zweiter `.then()`: Mit den Daten wird das DOM aktualisiert

### Warum fetch?

| Aspekt | XMLHttpRequest | fetch() |
|--------|---------------|---------|
| Codezeilen für einen Request | ~8-10 Zeilen | ~3-4 Zeilen |
| Fehlerbehandlung | Manuell (readyState, status) | Eingebaut via Promises |
| Dateiuploads (FormData) | Möglich, aber umständlich | Nativer Support |
| Browser-Support | Alle (auch IE) | Alle modernen Browser |
| Status | Legacy-API | Aktueller Standard |

**Kern-Argument für die Präsentation:**
> „`fetch()` ist der offizielle Nachfolger von `XMLHttpRequest`. Das Grundprinzip ist identisch — ein asynchroner HTTP-Request an den Server ohne Seitenreload. Der Unterschied liegt in der Syntax: statt Callback-Funktionen verwende ich Promises mit `.then()`, was den Code kürzer und lesbarer macht."

### Was ist ein Promise?

```
fetch("posts.php")                         // Promise wird erzeugt
│
├── .then(response => response.json())     // Wenn Antwort da → JSON parsen
│       │
│       └── .then(data => { ... })         // Wenn JSON geparst → Daten verarbeiten
│
└── .catch(error => { ... })               // Wenn Fehler → Fehler behandeln
```

Ein Promise ist ein Objekt, das einen Wert repräsentiert, der **jetzt noch nicht da ist, aber später kommen wird**. Statt einen Callback in `onreadystatechange` zu registrieren, kettet man die Verarbeitung mit `.then()` aneinander.

---

## 2. JSON-API statt PHP-generiertes HTML

### Was der Dozent gelehrt hat

```
┌──────────┐    Request     ┌──────────────────┐
│ Browser   │──────────────▶│  seite.php        │
│           │               │                   │
│           │    Fertiges    │  <?php            │
│           │◀── HTML ──────│  echo("<h1>...");  │
│           │               │  echo("<p>...");   │
│ Zeigt     │               │  ?>                │
│ HTML an   │               └──────────────────┘
└──────────┘

→ PHP erzeugt das komplette HTML und schickt es an den Browser.
→ Jede Aktion = neuer Seitenaufruf (Page Reload).
```

### Was ich verwende

```
┌──────────────┐  1. Lade HTML    ┌──────────────┐
│   Browser     │◀────────────────│  index.html   │  (statisch, einmalig)
│               │                 └──────────────┘
│               │
│  JavaScript   │  2. Hole Daten  ┌──────────────┐  3. DB-Abfrage  ┌───────┐
│  baut DOM     │────────────────▶│  posts.php    │────────────────▶│ MySQL │
│  dynamisch    │◀── JSON ────────│  (API)        │◀── Ergebnis ───│       │
│               │                 └──────────────┘                 └───────┘
│               │
│  4. Erstellt Karten aus JSON-Daten
│     und fügt sie ins DOM ein
└──────────────┘

→ PHP gibt nur JSON-Daten zurück: [{"id":1, "title":"...", ...}]
→ JavaScript erzeugt daraus die HTML-Elemente (Karten, Hero, etc.)
→ Kein Seitenreload nötig bei CRUD-Operationen.
```

### Warum dieser Ansatz?

- **Trennung von Daten und Darstellung:** Der Server kümmert sich nur um Daten, der Browser um die Anzeige
- **Kein Reload nötig:** Neuer Post erstellen → Karten werden neu geladen, ohne die ganze Seite neu zu laden
- **Gleiche API für alles:** Ein Endpunkt (`posts.php`) bedient alle Operationen (GET, POST, PUT, DELETE)

**Kern-Argument:**
> „In der Vorlesung wurde gezeigt, wie PHP HTML erzeugt. Ich habe die Datenbereitstellung und die Darstellung getrennt: `posts.php` liefert nur JSON-Daten, und JavaScript baut daraus die Oberfläche. Das Grundprinzip bleibt gleich — PHP holt Daten aus MySQL und gibt sie zurück — nur das Ausgabeformat unterscheidet sich."

---

## 3. Kein `<form>`-Tag — stattdessen JavaScript-Events

### Was der Dozent gelehrt hat

```html
<form action="verarbeitung.php" method="POST">
    <input type="text" name="titel">
    <input type="submit" value="Absenden">
</form>
```
→ Browser sendet Formular automatisch an `action`-URL
→ Seite wird neu geladen mit der Antwort von `verarbeitung.php`

### Was ich verwende

```html
<input type="text" id="new-post-title">
<button id="new-post-submit">Speichern</button>
```

```javascript
saveButton.addEventListener('click', () => {
    const formData = new FormData();
    formData.append('title', document.getElementById('new-post-title').value);
    // ... fetch() mit formData
});
```

→ Kein `<form>`-Tag, kein automatisches Absenden
→ JavaScript sammelt die Werte manuell ein und sendet sie per `fetch()`
→ **Vorteil:** Kein Page-Reload, Pop-up kann sich schließen, Karten werden direkt aktualisiert

**Kern-Argument:**
> „Das `<form>`-Tag sendet Daten mit einem Seitenreload. Da ich AJAX verwende, brauche ich keinen automatischen Formularversand — ich sammle die Eingaben per JavaScript ein und sende sie asynchron. Das Ergebnis ist das gleiche: die Daten kommen als POST-Request beim Server an."

---

## 4. Prepared Statements statt direkter SQL-Queries

### Was der Dozent gelehrt hat

```php
$query = "INSERT INTO tabelle (name) VALUES ('".$_POST['name']."')";
mysqli_query($verbindung, $query);
```

### Was ich verwende

```php
$stmt = mysqli_prepare($conn, "INSERT INTO posts (title) VALUES (?)");
mysqli_stmt_bind_param($stmt, "s", $title);
mysqli_stmt_execute($stmt);
```

### Warum?

```
Direktes Einfügen (unsicher):
    "SELECT * FROM users WHERE name = '" + userInput + "'"

    Wenn userInput = "'; DROP TABLE users; --"
    → "SELECT * FROM users WHERE name = ''; DROP TABLE users; --'"
    → Tabelle wird gelöscht! (SQL Injection)

Prepared Statement (sicher):
    "SELECT * FROM users WHERE name = ?"  +  Parameter: userInput

    Wenn userInput = "'; DROP TABLE users; --"  
    → Wird als normaler Text behandelt, nicht als SQL-Befehl
    → Kein Schaden möglich
```

**Kern-Argument:**
> „Prepared Statements schützen gegen SQL-Injection. Statt User-Eingaben direkt in den SQL-String einzubauen, werden sie als separate Parameter übergeben. Die Datenbank behandelt sie dann immer als Daten, nie als SQL-Befehle."

---

## 5. `localStorage` für Dark Mode

### Was das ist

```
┌─────────────────────────────────────────────────┐
│  Browser (localStorage)                          │
│                                                  │
│  Schlüssel    │  Wert                            │
│  ─────────────┼──────                            │
│  "theme"      │  "dark"                          │
│                                                  │
│  → Bleibt gespeichert, auch nach Browser-Schließen│
│  → Nur auf dieser Domain verfügbar               │
│  → Kein Server-Kontakt nötig                     │
└─────────────────────────────────────────────────┘
```

```javascript
// Speichern
localStorage.setItem('theme', 'dark');

// Lesen
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
}
```

**Kern-Argument:**
> „`localStorage` ist ein einfacher Schlüssel-Wert-Speicher im Browser. Ich nutze es, damit sich der Browser die Theme-Einstellung des Users merkt — ohne Datenbank oder Cookies. Das ist reines JavaScript, kein Framework."

---

## 6. CSS Custom Properties (Variablen)

### Was der Dozent gelehrt hat

```css
h1 { color: #b91c1c; }
p  { color: #b91c1c; }
```

### Was ich verwende

```css
:root {
    --main-red-color: #b91c1c;
}

h1 { color: var(--main-red-color); }
p  { color: var(--main-red-color); }
```

→ Farbe wird einmal definiert und überall referenziert
→ Änderung an einer Stelle ändert alle Verwendungen
→ Ist **Standard-CSS3**, kein Framework

---

## Zusammenfassung: Was ist gleich, was ist anders?

```
                    VORLESUNG                      MEIN PROJEKT
                    ─────────                      ────────────
Sprachen:           HTML, CSS, PHP, JS, MySQL      ✓ identisch

Server:             XAMPP (Apache + MySQL)          ✓ identisch

DB-Zugriff:         mysqli_connect / mysqli_query   ✓ mysqli (mit Prepared Stmts)

Datenfluss:         PHP erzeugt HTML                PHP liefert JSON,
                    Browser zeigt HTML an            JS baut HTML

AJAX:               XMLHttpRequest                  fetch() (modernere API,
                    + onreadystatechange             gleiches Prinzip)

Formulare:          <form action="" method="">      JS-EventListener
                    + Page Reload                    + fetch() ohne Reload

Frameworks:         Keine                           ✓ Keine
```

---

## Checkliste für die Präsentation

- [ ] Erkläre den Unterschied zwischen `XMLHttpRequest` und `fetch()` in eigenen Worten
- [ ] Erkläre was ein Promise ist (= Platzhalter für einen Wert, der noch kommt)
- [ ] Erkläre warum `posts.php` JSON zurückgibt statt HTML
- [ ] Erkläre was `FormData` ist und warum du es für Bild-Uploads brauchst
- [ ] Erkläre was ein Prepared Statement ist und warum es sicherer ist
- [ ] Erkläre was `localStorage` ist (Schlüssel-Wert-Speicher im Browser)
- [ ] Erkläre was CSS-Variablen (Custom Properties) sind
- [ ] Wisse, dass `globalThis` von SonarQube vorgeschlagen wurde (= `window` im Browser)
