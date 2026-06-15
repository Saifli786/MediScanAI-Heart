document.addEventListener('DOMContentLoaded', function () {
    const languageDropdownItems = document.querySelectorAll('.dropdown-menu a.dropdown-item');

    languageDropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const lang = this.getAttribute('href').split('/').pop();
            fetch(`/set_language/${lang}`)
                .then(() => {
                    location.reload();
                });
        });
    });
});
