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
const complaintForm = document.getElementById("complaintForm");

complaintForm?.addEventListener("submit", function(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const complaintCategory = document.getElementById("complaintCategory").value;
  const complaintDescription = document.getElementById("complaintDescription").value;
  const supportingDocuments = document.getElementById("supportingDocuments").files;
  const witnesses = document.getElementById("witnesses").value;
  const desiredOutcome = document.getElementById("desiredOutcome").value;

  // Here you can handle the form data, send it to the server, or store it in local storage for testing
  console.log("Complaint Submitted:", {
    fullName,
    email,
    complaintCategory,
    complaintDescription,
    supportingDocuments,
    witnesses,
    desiredOutcome
  });

  complaintForm.reset();
  alert("Your complaint has been submitted successfully!");
});

// Tracking Support
// Tracking Support
const trackingForm = document.getElementById("trackingForm");
const trackingIDInput = document.getElementById("trackingID");
const trackingResult = document.getElementById("trackingResult");
const noTrackingResult = document.getElementById("noTrackingResult");

trackingForm?.addEventListener("submit", function(event) {
  event.preventDefault();

  const trackingID = trackingIDInput.value;

  // Sample data for demo purposes
  const sampleComplaintData = {
    "1234": {
      status: "Pending",
      complaintCategory: "Workplace",
      complaintDescription: "Unsafe working conditions.",
      desiredOutcome: "Safe working environment.",
      updatedAt: "2025-04-28"
    },
    "5678": {
      status: "Resolved",
      complaintCategory: "Health and Medical",
      complaintDescription: "Lack of medical facilities.",
      desiredOutcome: "Immediate medical attention.",
      updatedAt: "2025-04-20"
    }
  };

  // Check if complaint exists for the provided Tracking ID
  if (sampleComplaintData[trackingID]) {
    const complaint = sampleComplaintData[trackingID];
    document.getElementById("status").textContent = complaint.status;
    document.getElementById("complaintCategory").textContent = complaint.complaintCategory;
    document.getElementById("complaintDescription").textContent = complaint.complaintDescription;
    document.getElementById("desiredOutcome").textContent = complaint.desiredOutcome;
    document.getElementById("updatedAt").textContent = complaint.updatedAt;
    trackingResult.classList.remove("d-none");
    noTrackingResult.classList.add("d-none");
  } else {
    trackingResult.classList.add("d-none");
    noTrackingResult.classList.remove("d-none");
  }
});


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
