const buttons = document.querySelectorAll('#navButtons button');
        const sections = document.querySelectorAll('.section');

        function scrollToSection(id) {
            document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
        }

        window.addEventListener('scroll', () => {
            let scrollPos = window.scrollY + window.innerHeight / 1;
            sections.forEach((section, index) => {
                if (
                    scrollPos >= section.offsetTop &&
                    scrollPos < section.offsetTop + section.offsetHeight
                ) {
                    buttons.forEach(btn => btn.classList.remove('active'));
                    buttons[index + 1].classList.add('active');
                }
            });
        });