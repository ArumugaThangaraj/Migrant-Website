document.addEventListener("DOMContentLoaded", () => {
    const registrationForm = document.getElementById("registrationForm");

    // Occupation dropdown change event
    document.getElementById("occupation").addEventListener("change", function () {
        const occupationSelect = this.value;
        const otherOccupationContainer = document.getElementById("other-occupation-container");
        if (occupationSelect === "other") {
            otherOccupationContainer.style.display = "block";
        } else {
            otherOccupationContainer.style.display = "none";
        }
    });

    // Tooltips initialization
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

    // Real-time validation for fields
    document.querySelectorAll("[required]").forEach((field) => {
        field.addEventListener("input", () => {
            if (!field.checkValidity()) {
                field.classList.add("is-invalid");
                field.classList.remove("is-valid");
            } else {
                field.classList.add("is-valid");
                field.classList.remove("is-invalid");
            }
        });
    });

    // Form submission handling
    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Validate Work Occupation
        const occupation = document.getElementById("occupation").value;
        if (occupation === "other" && !document.getElementById("other-occupation").value.trim()) {
            alert("Please specify your occupation if you selected 'Other'.");
            return;
        }

        // Validate DOB (must be over 16 years old)
        const dob = document.getElementById("dob").value;
        const dobDate = new Date(dob);
        const age = new Date().getFullYear() - dobDate.getFullYear();
        const month = new Date().getMonth();
        const day = new Date().getDate();
        if (age < 16 || (age === 16 && (month < dobDate.getMonth() || (month === dobDate.getMonth() && day < dobDate.getDate())))) {
            alert("You must be at least 16 years old.");
            return;
        }

        // Password validation
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

        if (!passwordRegex.test(password)) {
            alert("Password must contain at least one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        // Validate required fields
        const requiredFields = document.querySelectorAll("[required]");
        let allFieldsFilled = true;
        let missingFields = [];
        requiredFields.forEach(function (field) {
            if (!field.value.trim()) {
                allFieldsFilled = false;
                missingFields.push(field.name);
            }
        });

        if (!allFieldsFilled) {
            alert("Please fill out the following fields: " + missingFields.join(", "));
            return;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append("name", document.getElementById("name").value);
        formData.append("dob", document.getElementById("dob").value);
        formData.append("gender", document.getElementById("gender").value);
        formData.append("state", document.getElementById("state").value);
        formData.append("nationality", document.getElementById("nationality").value);
        formData.append("marital-status", document.getElementById("marital-status").value);
        formData.append("id-type", document.getElementById("id-type").value);
        formData.append("id-number", document.getElementById("id-number").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("phone", document.getElementById("phone").value);
        formData.append("password", document.getElementById("password").value);
        formData.append("confirm-password", document.getElementById("confirm-password").value);
        formData.append("emergency-contact-name", document.getElementById("emergency-contact-name").value);
        formData.append("emergency-contact", document.getElementById("emergency-contact").value);
        formData.append("temporary-address", document.getElementById("temporary-address").value);
        formData.append("permanent-address", document.getElementById("permanent-address").value);
        formData.append("occupation", document.getElementById("occupation").value);
        formData.append("other-occupation", document.getElementById("other-occupation").value);
        formData.append("work-location", document.getElementById("work-location").value);
        formData.append("terms", document.getElementById("terms").checked);

        // Submit via fetch
        fetch("/registration", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else if (response.ok) {
                    alert("Registration successful!");
                    registrationForm.reset();
                } else {
                    alert("Registration failed. Please try again.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            });
    });

    const idType = document.getElementById('id-type');
    const idNumber = document.getElementById('id-number');
    const feedback = document.getElementById('id-number-feedback');

    function validateIdNumber() {
        const type = idType.value;
        const value = idNumber.value.trim();
        let valid = false;
        let message = '';

        if (type === 'aadhar') {
            valid = /^\d{12}$/.test(value);
            message = 'Aadhaar number must be exactly 12 digits.';
        } else if (type === 'passport') {
            valid = /^[A-Za-z0-9]{8}$/.test(value);
            message = 'Passport number must be 8 alphanumeric characters.';
        } else if (type === 'voter-id') {
            valid = /^[A-Za-z]{3}\d{7}$/.test(value);
            message = 'Voter ID must start with 3 letters followed by 7 digits.';
        }

        if (!valid && value.length > 0) {
            idNumber.classList.add('is-invalid');
            feedback.textContent = message;
        } else {
            idNumber.classList.remove('is-invalid');
            feedback.textContent = '';
        }
        return valid;
    }

    idType.addEventListener('change', function () {
        idNumber.value = '';
        idNumber.classList.remove('is-invalid');
        feedback.textContent = '';
        idNumber.setAttribute('placeholder',
            idType.value === 'aadhar' ? '12 digit number' :
                idType.value === 'passport' ? '8 alphanumeric characters' :
                    idType.value === 'voter-id' ? '3 letters + 7 digits' : ''
        );
    });

    idNumber.addEventListener('input', validateIdNumber);

    // Prevent form submission if invalid
    document.getElementById('registrationForm').addEventListener('submit', function (e) {
        if (!validateIdNumber()) {
            e.preventDefault();
            idNumber.focus();
        }
    });
});