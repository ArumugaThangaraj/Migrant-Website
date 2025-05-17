
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// Get input elements (not values)
const passwordField = document.getElementById("password");
const confirmPasswordField = document.getElementById("confirm-password");
const submitBtn = document.getElementById("reg");
const invalidFeedback = confirmPasswordField.nextElementSibling; // .invalid-feedback div

function checkPasswordsMatch() {
  if (
    passwordField.value &&
    confirmPasswordField.value &&
    passwordField.value !== confirmPasswordField.value
  ) {
    invalidFeedback.style.display = "block";
    submitBtn.disabled = true;
  } else {
    invalidFeedback.style.display = "none";
    submitBtn.disabled = false;
  }
}

passwordField.addEventListener("input", checkPasswordsMatch);
confirmPasswordField.addEventListener("input", checkPasswordsMatch);

// Hide feedback on page load
invalidFeedback.style.display = "none";


document.getElementById("registrationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form values
  const name = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const state = document.getElementById("state").value;
  const nationality = document.getElementById("nationality").value;
  const maritalStatus = document.getElementById("marital-status").value;
  const idType = document.getElementById("id-type").value;
  const idNumber = document.getElementById("id-number").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const emergencyContactName = document.getElementById("emergency-contact-name").value;
  const emergencyContact = document.getElementById("emergency-contact").value;
  const temporaryAddress = document.getElementById("temporary-address").value;
  const permanentAddress = document.getElementById("permanent-address").value;
  const occupation = document.getElementById("occupation").value;
  const otherOccupation = document.getElementById("other-occupation").value;
  const workLocation = document.getElementById("work-location").value;

  try {
    // 1. Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Send email verification
    await sendEmailVerification(user);
    alert("Verification email sent. Please check your inbox.");

    // Show "Continue after verification" button
    document.getElementById("verifyCheckBtn").style.display = "block";

    // 3. Store user data in Firestore
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, {
      name,
      dob,
      gender,
      state,
      nationality,
      maritalStatus,
      idType,
      idNumber,
      email,
      phone,
      emergencyContactName,
      emergencyContact,
      temporaryAddress,
      permanentAddress,
      occupation: occupation === "other" ? otherOccupation : occupation,
      workLocation,
      emailVerified: false
    });

    // Clear form
    document.getElementById("registrationForm").reset();
  } catch (error) {
    console.error("Registration Error:", error);
    alert(error.message);
  }
});

// Show/hide other occupation field
const occupationField = document.getElementById("occupation");
const otherOccupationContainer = document.getElementById("other-occupation-container");

occupationField.addEventListener("change", () => {
  if (occupationField.value === "other") {
    otherOccupationContainer.style.display = "block";
  } else {
    otherOccupationContainer.style.display = "none";
  }
});

// Handle "Continue after verifying" button click
const verifyCheckBtn = document.getElementById("verifyCheckBtn");
verifyCheckBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const registerForm = document.getElementById("registrationForm");

  // Show temporary message while checking
  const originalText = document.getElementById("verifyCheckBtn").innerText;
  verifyCheckBtn.innerText = "Checking verification...";

  try {
    await user.reload();

    if (user.emailVerified) {
      alert("✅ Email verified! Redirecting to login page...");
      registerForm.style.display = "none";
      verifyCheckBtn.style.display = "block";
      window.location.href = "/userlogin";
    } else {
      alert("❌ Email not verified yet. Please check your inbox.");
    }
  } catch (error) {
    console.error("Verification Check Error:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    verifyCheckBtn.innerText = originalText;
  }
});

