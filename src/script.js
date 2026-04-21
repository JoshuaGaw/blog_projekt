const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const card1 = document.getElementById('card1');

// Check for saved user preference
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    card1.classList.add('dark-mode');
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    card1.classList.toggle('dark-mode');

    // Save preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
