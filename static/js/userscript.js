const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("menuToggle");
const cBox = document.querySelectorAll(".content-box");


// Sidebar toggle for mobile view
toggleBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("show");

  // Check if the screen size is large (width >= 768px)
  if (window.innerWidth >= 768) {
    cBox.forEach(box => {
      if (sidebar.classList.contains('show')) {
        box.style.width = "calc(100% - 250px)";
      } else {
        box.style.width = "100%";
      }
    });
  }
});



function showContent(id) {
  cBox.forEach(section => {
    section.classList.add("d-none");
  });
  document.getElementById(id).classList.remove("d-none");

  // Auto close on mobile
  if (window.innerWidth < 768) {
    sidebar.classList.remove("show");
  }
}
const uploadButton = document.getElementById('uploadButton');
const profileImageInput = document.getElementById('profileImageInput');
const profileImage = document.getElementById('profileImage');

uploadButton.addEventListener('click', () => {
  profileImageInput.click();
});

profileImageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});


// Complaint registeration
// ...existing code...

const complaintForm = document.getElementById("complaintForm");

// Remove any existing event listeners before adding a new one
if (complaintForm) {
  complaintForm.addEventListener("submit", handleComplaintSubmit);
}

function handleComplaintSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  // Disable the submit button to prevent double submission
  const submitBtn = complaintForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  const formData = new FormData();
  formData.append("fullName", document.getElementById("fullName").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("complaintCategory", document.getElementById("complaintCategory").value);
  formData.append("complaintDescription", document.getElementById("complaintDescription").value);
  formData.append("witnesses", document.getElementById("witnesses").value);
  formData.append("desiredOutcome", document.getElementById("desiredOutcome").value);

  const files = document.getElementById("supportingDocuments").files;
  for (let i = 0; i < files.length; i++) {
    formData.append("supportingDocuments", files[i]);
  }

  fetch("/complaint-submit", {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Your complaint has been submitted successfully! Tracking ID: " + data.tracking_id);
      complaintForm.reset();
    } else {
      alert("Error: " + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("Submission failed.");
  })
  .finally(() => {
    if (submitBtn) submitBtn.disabled = false;
  });
}

// ...existing code...

// Tracking Support
const trackingForm = document.getElementById("trackingForm");
const trackingIDInput = document.getElementById("trackingID");
const trackingResult = document.getElementById("trackingResult");
const noTrackingResult = document.getElementById("noTrackingResult");

if (trackingForm) {
  trackingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const trackingID = trackingIDInput.value.trim();

    fetch("/track_complaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ trackingID })
    })
      .then(response => response.json())
      .then(data => {
        if (data.found) {
          document.getElementById("trackingIdResult").textContent = trackingID;
          document.getElementById("status").textContent = data.status || "";
          document.getElementById("category").textContent = data.category || "";
          document.getElementById("description").textContent = data.description || "";
          document.getElementById("desired_outcome").textContent = data.desired_outcome || "";
          document.getElementById("updated_at").textContent = data.updated_at || "";
          trackingResult.classList.remove("d-none");
          noTrackingResult.classList.add("d-none");
        } else {
          trackingResult.classList.add("d-none");
          noTrackingResult.classList.remove("d-none");
        }
      })
      .catch(() => {
        trackingResult.classList.add("d-none");
        noTrackingResult.classList.remove("d-none");
      });
  });
}

// News Fetch
const newsContainer = document.getElementById("newsContainer");
const loadMoreBtn = document.getElementById("loadMore");

const apiKey = '70924037cffe42979c363284c439ae5e';  // Replace with your actual NewsAPI key
let currentPage = 1;
const pageSize = 5;  // Number of articles to load per page

// Fetch News related to migrant workers
async function fetchNews(page = 1) {
  const url = `https://newsapi.org/v2/everything?q=migrant+workers&apiKey=${apiKey}&pageSize=${pageSize}&page=${page}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok' && data.articles.length > 0) {
      displayNewsArticles(data.articles);
    } else {
      displayNoNewsMessage();
    }
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

// Display news articles
function displayNewsArticles(articles) {
  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('news-article');
    articleElement.innerHTML = `
      <h5><a href="${article.url}" target="_blank">${article.title}</a></h5>
      <p>${article.description}</p>
      <small>Published on: ${new Date(article.publishedAt).toLocaleDateString()}</small>
      <hr />
    `;
    newsContainer.appendChild(articleElement);
  });
}

// Show message if no news found
function displayNoNewsMessage() {
  const noNewsMessage = document.createElement('p');
  noNewsMessage.textContent = "No relevant news found. Please try again later.";
  noNewsMessage.classList.add('text-warning');
  newsContainer.appendChild(noNewsMessage);
}

// Load more news articles when button is clicked
loadMoreBtn?.addEventListener("click", function() {
  currentPage++;
  fetchNews(currentPage);
});

fetchNews();
