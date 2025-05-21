const buttons = document.querySelectorAll('#navButtons button');
const sections = document.querySelectorAll('.section');
const navButtons = document.getElementById('navButtons');
const navInitialTop = navButtons.style.top || "80px"; 

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    // Use window.innerHeight / 2 to trigger when the section is in the middle of the viewport
    let scrollPos = window.scrollY + window.innerHeight / 2;
    sections.forEach((section, index) => {
        if (
            scrollPos >= section.offsetTop &&
            scrollPos < section.offsetTop + section.offsetHeight
        ) {
            buttons.forEach(btn => btn.classList.remove('active'));
            buttons[index + 1].classList.add('active');
        }
    });

    // Set navButtons top to 0 when scrolled, else restore initial
    if (window.scrollY > 0) {
        navButtons.style.top = "0";
    } else {
        navButtons.style.top = navInitialTop;
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('navButtons');
    sidebar.classList.toggle('active');
}


document.getElementById('langBtn').addEventListener('click', function(event) {
    event.stopPropagation();
    var el = document.getElementById('google_translate_element');
    if (el.style.display === "none" || el.style.display === "") {
        el.style.display = "block";
    } else {
        el.style.display = "none";
    }
});
// Hide the widget if clicking outside
document.addEventListener('click', function(e) {
    var el = document.getElementById('google_translate_element');
    if (el && !el.contains(e.target) && e.target.id !== 'langBtn') {
        el.style.display = "none";
    }
});

