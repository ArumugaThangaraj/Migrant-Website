import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import (
    Flask,
    request,
    render_template,
    redirect,
    url_for,
    session,
    jsonify,
    flash,
    render_template_string,
    make_response,
)
import pyrebase
from functools import wraps
import datetime
import json
import os
from werkzeug.utils import secure_filename


firebase_creds_env = os.environ.get("FIREBASE_CREDENTIALS")

if firebase_creds_env:
    firebase_creds_dict = json.loads(firebase_creds_env)
    cred = credentials.Certificate(firebase_creds_dict)
else:
    cred = credentials.Certificate("adminsdk.json")

# ✅ Initialize Firebase Admin only once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Firebase JS SDK config
firebase_Config = {
    "apiKey": "AIzaSyDk_ATpeRx7lSm1Bj8lL3YJqS8Dzrovm1w",
    "authDomain": "migrant-support-hub-ed02c.firebaseapp.com",
    "projectId": "migrant-support-hub-ed02c",
    "storageBucket": "migrant-support-hub-ed02c.firebasestorage.app",
    "messagingSenderId": "1093269407270",
    "appId": "1:1093269407270:web:ac56480a66211dd0ca88e7",
    "measurementId": "G-5Y8X1JHG75",
    "databaseURL": "",
}

# Initialize Pyrebase
pb = pyrebase.initialize_app(firebase_Config)

app = Flask(__name__)

app.secret_key = "123algfdriuvcdtg577889"


# Authentication decorators
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("userlogin"))
        return f(*args, **kwargs)

    return decorated_function


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session or not session.get("is_admin", False):
            return redirect(url_for("adminlogin"))
        return f(*args, **kwargs)

    return decorated_function


@app.route("/")
@app.route("/index")
def index():
    return render_template("index.html")


@app.route("/userlogin", methods=["GET", "POST"])
def userlogin():
    if request.method == "POST":
        # Try to get JSON data first
        data = request.get_json(silent=True)
        if data and "email" in data and "password" in data:
            email = data["email"]
            password = data["password"]
        else:
            # Fallback to form data
            email = request.form.get("email")
            password = request.form.get("password")

        if not email or not password:
            return jsonify({"error": "Invalid request"}), 400

        try:
            user = pb.auth().sign_in_with_email_and_password(email, password)
            user_id = user["localId"]  # This is the Firebase Auth User ID
            session["user"] = user["email"]  # or any value, just to mark as logged in
            session["user_token"] = user["idToken"]
            session["user_id"] = user["localId"]  # For Pyrebase
            return redirect(url_for("userdashboard"))
        except Exception as e:
            error_message = str(e)
            if "INVALID_LOGIN_CREDENTIALS" in error_message:
                error_message = "Invalid email or password"
            flash(error_message, "danger")
            return render_template("userlogin.html")
    return render_template("userlogin.html")


@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = request.form.get("email")

    if not email:
        return render_template_string(
            """
            <script>alert("Email is required."); window.history.back();</script>
        """
        )

    try:
        pb.auth().send_password_reset_email(email)
        return render_template_string(
            """
            <script>alert("Password reset email sent successfully. Please check your inbox."); window.history.back();</script>
        """
        )
    except Exception as e:
        error_message = str(e)
        if "EMAIL_NOT_FOUND" in error_message or "INVALID_EMAIL" in error_message:
            return render_template_string(
                """
                <script>alert("Failed to send reset email. Please enter a valid registered email."); window.history.back();</script>
            """
            )
        else:
            return render_template_string(
                """
                <script>alert("An error occurred. Please try again later."); window.history.back();</script>
            """
            )


@app.route("/registration", methods=["GET", "POST"])
def registration():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        name = request.form.get("name")

        try:
            # Create Firebase Auth user
            user = auth.create_user(email=email, password=password, display_name=name)

            # Store additional data in Firestore
            user_data = {
                "name": name,
                "dob": request.form.get("dob"),
                "gender": request.form.get("gender"),
                "state": request.form.get("state"),
                "nationality": request.form.get("nationality"),
                "marital_status": request.form.get("marital-status"),
                "id_type": request.form.get("id-type"),
                "id_number": request.form.get("id-number"),
                "email": email,
                "phone": request.form.get("phone"),
                "emergency_contact_name": request.form.get("emergency-contact-name"),
                "emergency_contact": request.form.get("emergency-contact"),
                "temporary_address": request.form.get("temporary-address"),
                "permanent_address": request.form.get("permanent-address"),
                "occupation": request.form.get("occupation"),
                "other_occupation": request.form.get("other-occupation") or None,
                "work_location": request.form.get("work-location") or None,
                "created_at": datetime.datetime.utcnow(),
                "complaints": [],
                "email_verified": False,  # You can update this later when verified
            }

            db.collection("users").document(user.uid).set(user_data)

            flash(
                "Registration successful! Please verify your email before logging in.",
                "success",
            )
            return redirect(url_for("userlogin"))

        except Exception as e:
            flash(f"Error during registration: {str(e)}", "danger")
            return render_template("registration.html")

    return render_template("registration.html")


@app.route("/adminlogin", methods=["GET", "POST"])
def adminlogin():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        # Hardcoded admin credentials (for demo only)
        if email == "admin@example.com" and password == "admin123":
            try:
                # Create or get admin user
                try:
                    user = auth.get_user_by_email(email)
                except:
                    user = auth.create_user(
                        email=email, password=password, display_name="Admin"
                    )

                # Set admin custom claim
                auth.set_custom_user_claims(user.uid, {"admin": True})

                session["user"] = "admin_token"
                session["user_id"] = user.uid  # For admin SDK
                session["is_admin"] = True
                return redirect(url_for("admindashboard"))
            except Exception as e:
                flash(f"Error: {str(e)}", "danger")
                return render_template("adminlogin.html")

        flash("Invalid admin credentials", "danger")
        return render_template("adminlogin.html")

    return render_template("adminlogin.html")


@app.route("/admindashboard")
@admin_required
def admindashboard():
    # Get all complaints with user info
    complaints = []
    users_ref = db.collection("users")

    for user_doc in users_ref.stream():
        user_data = user_doc.to_dict()
        for complaint in user_data.get("complaints", []):
            print("Checking complaint ID:", complaint.get("id"))
            complaint["user_name"] = user_data.get("name", "Unknown")
            complaint["user_email"] = user_data.get("email", "Unknown")
            complaint["user_id"] = user_doc.id
            complaints.append(complaint)

    # Render template with complaints
    response = make_response(render_template("admindashboard.html", complaints=complaints))

    # 🔒 Add cache prevention headers
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    return response


@app.route("/update_complaint_status", methods=["POST"])
@admin_required
def update_complaint_status():
    data = request.get_json()
    user_id = data.get("user_id")
    complaint_id = data.get("complaint_id")
    new_status = data.get("status")

    try:
        user_ref = db.collection("users").document(user_id)
        user_data = user_ref.get().to_dict()
        complaints = user_data.get("complaints", [])
        updated = False

        for complaint in complaints:
            if complaint.get("id") == complaint_id:
                complaint["status"] = new_status
                complaint["updated_at"] = datetime.datetime.now()
                updated = True
                break

        if updated:
            user_ref.update({"complaints": complaints})
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Complaint not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/userdashboard")
@login_required
def userdashboard():
    user_id = session["user_id"]  # Get user ID from session
    user_ref = db.collection("users").document(user_id)
    user_data = user_ref.get().to_dict()
    # Calculate complaint stats
    complaints = user_data.get("complaints", [])
    total_complaints = len(complaints)
    resolved_complaints = len([c for c in complaints if c.get("status") == "Resolved"])
    pending_complaints = total_complaints - resolved_complaints

    return render_template(
        "userdashboard.html",
        user=user_data,
        user_id=user_id,
        total_complaints=total_complaints,
        resolved_complaints=resolved_complaints,
        pending_complaints=pending_complaints,
        complaints=complaints,
    )


@app.route("/submit_complaint", methods=["POST"])
@login_required
def submit_complaint():
    user_id = session["user_id"]
    complaint_data = {
        "id": str(datetime.datetime.now().timestamp()),  # Tracking ID
        "category": request.form.get("complaintCategory"),
        "description": request.form.get("complaintDescription"),
        "desired_outcome": request.form.get("desiredOutcome"),
        "witnesses": request.form.get("witnesses"),
        "status": "Pending",
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now(),
        # You can add file handling here if needed
    }

    try:
        user_ref = db.collection("users").document(user_id)
        user_ref.update({"complaints": firestore.ArrayUnion([complaint_data])})
        return jsonify({"success": True, "complaint_id": complaint_data["id"]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/get_complaint_status", methods=["POST"])
@login_required
def get_complaint_status():
    user_id = session["user_id"]
    complaint_id = request.form.get("complaint_id")

    try:
        user_ref = db.collection("users").document(user_id)
        user_data = user_ref.get().to_dict()

        for complaint in user_data.get("complaints", []):
            if complaint.get("id") == complaint_id:
                return jsonify(
                    {
                        "found": True,
                        "status": complaint.get("status"),
                        "category": complaint.get("category"),
                        "description": complaint.get("description"),
                        "desired_outcome": complaint.get("desired_outcome"),
                        "updated_at": str(complaint.get("updated_at")),
                        "supporting_documents": complaint.get(
                            "supporting_documents", []
                        ),
                    }
                )

        return jsonify({"success": False, "error": "Complaint not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/track_complaint", methods=["POST"])
def track_complaint():
    tracking_id = request.json.get("trackingID")
    users = db.collection("users").stream()
    for user in users:
        user_data = user.to_dict()
        for complaint in user_data.get("complaints", []):
            if complaint.get("id") == tracking_id:
                return jsonify(
                    {
                        "found": True,
                        "status": complaint.get("status"),
                        "category": complaint.get("category"),
                        "description": complaint.get("description"),
                        "desired_outcome": complaint.get("desired_outcome"),
                        "updated_at": str(complaint.get("updated_at")),
                    }
                )
    return jsonify({"found": False})


@app.route("/complaint-submit", methods=["POST"])
@login_required
def complaint_submit():
    try:
        user_id = session["user_id"]
        # Collect form data
        full_name = request.form.get("fullName")
        email = request.form.get("email")
        category = request.form.get("complaintCategory")
        description = request.form.get("complaintDescription")
        witnesses = request.form.get("witnesses")
        desired_outcome = request.form.get("desiredOutcome")

        # Handle file uploads (store locally; for production, use cloud storage)
        file_urls = []
        files = request.files.getlist("supportingDocuments")
        upload_folder = "uploads"
        os.makedirs(upload_folder, exist_ok=True)
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                filepath = os.path.join(upload_folder, filename)
                file.save(filepath)
                file_urls.append(filepath)

        # Generate tracking ID
        tracking_id = str(int(datetime.datetime.now().timestamp()))

        # Build complaint data
        complaint_data = {
            "id": tracking_id,
            "full_name": full_name,
            "email": email,
            "category": category,
            "description": description,
            "witnesses": witnesses,
            "desired_outcome": desired_outcome,
            "supporting_documents": file_urls,
            "status": "Pending",
            "created_at": datetime.datetime.now(),
            "updated_at": datetime.datetime.now(),
        }

        # Store complaint inside the user's document
        user_ref = db.collection("users").document(user_id)
        user_ref.update({"complaints": firestore.ArrayUnion([complaint_data])})

        return jsonify({"success": True, "tracking_id": tracking_id})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/info")
def info():
    return render_template("info.html")


@app.route("/terms&condition")
def terms():
    return render_template("terms&condition.html")


@app.route("/privacypolicy")
def privacy():
    return render_template("privacypolicy.html")


@app.route("/forum", methods=["GET", "POST"])
@login_required
def forum():
    # ✅ Get email entered in forum-auth step
    forum_email = session.get("forum_user_email")

    if not forum_email:
        flash("Please verify your email to enter the forum.", "warning")
        return redirect(url_for("forum_auth"))

    try:
        # ✅ Get UID of the email
        user_record = auth.get_user_by_email(forum_email)
        user_id = user_record.uid

        # ✅ Get user data from Firestore
        user_doc = db.collection("users").document(user_id).get()
        user_data = user_doc.to_dict()
        username = user_data.get(
            "name", forum_email
        )  # fallback to email if name missing

    except Exception as e:
        print("Error loading forum user:", e)
        flash("Could not load user profile.", "danger")
        return redirect(url_for("forum_auth"))

    # ✅ Fetch forum posts
    forum_posts = (
        db.collection("forum_posts")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .stream()
    )
    posts = []

    for post in forum_posts:
        p = post.to_dict()
        p["id"] = post.id
        posts.append(p)

    return render_template("forum.html", username=username, posts=posts)


@app.route("/forum-auth", methods=["GET", "POST"])
@login_required
def forum_auth():
    if request.method == "POST":
        email = request.form.get("email")

        try:
            # Fetch user from Firebase Auth
            user = auth.get_user_by_email(email)

            # ✅ Get Firestore data using the correct UID
            user_doc = db.collection("users").document(user.uid).get()
            user_data = user_doc.to_dict()

            if not user_data:
                flash("User profile not found in Firestore. Please register.", "danger")
                return redirect(url_for("registration"))

            if user.email_verified:
                session["forum_user_email"] = email
                session["forum_user_name"] = user_data.get("name", email)  # fallback
                return redirect(url_for("forum"))
            else:
                flash(
                    "Email exists but is not verified. Please verify your email.",
                    "danger",
                )
                return redirect(url_for("forum_auth"))

        except Exception as e:
            print("Error:", e)
            flash("Email not found in Firebase. Please register first.", "danger")
            return redirect(url_for("registration"))

    return render_template("forum_auth.html")


@app.route("/forum/post", methods=["POST"])
@login_required
def post_message():
    if "forum_user_email" not in session or "forum_user_name" not in session:
        return redirect(url_for("forum_auth"))

    content = request.form.get("content")
    if not content:
        flash("Message cannot be empty", "danger")
        return redirect(url_for("forum"))

    db.collection("forum_posts").add(
        {
            "author": session["forum_user_name"],  # ✅ Use name instead of email
            "content": content,
            "created_at": datetime.datetime.utcnow(),
            "replies": [],
        }
    )

    return redirect(url_for("forum"))


@app.route("/forum/reply/<post_id>", methods=["POST"])
@login_required
def reply_to_post(post_id):
    if "forum_user_name" not in session:
        return redirect(url_for("forum_auth"))

    reply_content = request.form.get("reply")
    if not reply_content:
        flash("Reply cannot be empty", "danger")
        return redirect(url_for("forum"))

    post_ref = db.collection("forum_posts").document(post_id)

    reply = {
        "author": session["forum_user_name"],  # ✅ Use name instead of email
        "content": reply_content,
        "created_at": datetime.datetime.utcnow(),
    }

    post_ref.update({"replies": firestore.ArrayUnion([reply])})

    return redirect(url_for("forum"))

@app.route('/admin/forum/posts')
@admin_required
def admin_forum_posts():
    posts_ref = db.collection('forum_posts').order_by('created_at', direction=firestore.Query.DESCENDING).stream()

    posts = []
    for post in posts_ref:
        post_data = post.to_dict()
        post_data['id'] = post.id
        posts.append(post_data)

    return jsonify(posts)
@app.route('/admin/delete_post/<post_id>', methods=['POST'])
@admin_required
def delete_forum_post(post_id):
    db.collection('forum_posts').document(post_id).delete()
    return redirect(url_for('admin_forum_posts'))  # Or just return a JSON response



if __name__ == "__main__":
    app.run(debug=True)
