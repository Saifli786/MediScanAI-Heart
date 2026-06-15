document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkModeLink = document.getElementById('dark-mode-css');

    if (!themeToggleBtn || !darkModeLink) {
        return;
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            darkModeLink.disabled = false; // Enable dark mode CSS
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun me-1"></i>Light';
        } else {
            document.body.classList.remove('dark-theme');
            darkModeLink.disabled = true; // Disable dark mode CSS
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon me-1"></i>Dark';
        }
    }

    // Initialize theme based on localStorage or default
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', function () {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        // Optionally notify server about theme change
        fetch('/toggle_theme').catch(err => console.log('Theme toggle notification failed:', err));
    });
});
