
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupform");

    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Check if passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Send signup data to the backend
            const response = await fetch("/usersignup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                window.location.href = result.redirect; // Redirect to user dashboard
            } else {
                const error = await response.json();
                alert(error.error || "Signup failed. Please try again.");
            }
        });
    }
});