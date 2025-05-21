document.addEventListener("DOMContentLoaded", function () {
    const complaintForm = document.getElementById("complaintForm");
    if (complaintForm) {
        complaintForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData();
            formData.append("complaintCategory", document.getElementById("complaintCategory").value);
            formData.append("complaintDescription", document.getElementById("complaintDescription").value);
            formData.append("desiredOutcome", document.getElementById("desiredOutcome").value);
            formData.append("witnesses", document.getElementById("witnesses").value);
            // Add supporting documents if any
            const files = document.getElementById("supportingDocuments").files;
            for (let i = 0; i < files.length; i++) {
                formData.append("supportingDocuments", files[i]);
            }

            fetch("/submit_complaint", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Complaint submitted! Your Tracking ID is: " + data.complaint_id);
                    complaintForm.reset();
                } else {
                    alert("Error: " + data.error);
                }
            })
            .catch(() => alert("Submission failed. Please try again."));
        });
    }
});