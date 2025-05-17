from flask import Flask, request, session, redirect, url_for, render_template, jsonify
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, auth, firestore

# Initialize Flask
app = Flask(__name__)
app.secret_key = "d5c4f90df160b3813bff63c599d81f27"

# ✅ Firebase Admin SDK Initialization
cred = credentials.Certificate("firebaseServiceKey.json") 
firebase_admin.initialize_app(cred)
db = firestore.client()
CORS(app)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/userlogin")
def user_login():
    return render_template("userlogin.html")

@app.route("/login", methods=["POST"])
def login():
    return render_template("userlogin.html")

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = request.form.get("email")
    if email:
        print(f"Password reset link sent to {email}")
        return redirect("/userlogin")
    return "Error: Email not provided", 400

@app.route("/userdashboard")
def user_dashboard():
    if "user_id" not in session:
        print("No session found")
        return redirect(url_for("home"))
    print("Logged in user ID:", session["user_id"])
    return render_template("userdashboard.html", user_id=session["user_id"])


@app.route("/adminlogin")
def admin_login():
    return render_template("adminlogin.html")

@app.route("/admindashboard")
def admin_dashboard():
    return render_template("admindashboard.html")

@app.route("/registration", methods=["GET", "POST"])
def registration():
    return render_template("registration.html")

@app.route("/terms-and-conditions")
def terms_and_conditions():
    return render_template("terms&condition.html")

@app.route("/privacy-policy")
def privacy_policy():
    return render_template("privacypolicy.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

# ✅ NEW: User Login Backend - Verifies Firebase ID Token
@app.route("/session-login", methods=["POST"])
def session_login():
    try:
        id_token = request.json.get("idToken")
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")

        session["user_id"] = uid
        session["email"] = email

        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401


@app.route("/info")
def info():
    return render_template("info.html")


# ✅ ✅ ✅ NEW CODE: Register API for Firebase Integration
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json()

    try:
        # Create user with email and password
        user_record = auth.create_user(
            email=data["email"],
            email_verified=False,
            password=data["password"],
            phone_number=data["phone"],
            display_name=data["name"],
            disabled=False
        )

        # Prepare Firestore data
        user_data = {
            "name": data["name"],
            "dob": data["dob"],
            "gender": data["gender"],
            "state": data["state"],
            "nationality": data["nationality"],
            "maritalStatus": data["maritalStatus"],
            "idType": data["idType"],
            "idNumber": data["idNumber"],
            "email": data["email"],
            "phone": data["phone"],
            "emergencyContactName": data["emergencyContactName"],
            "emergencyContactPhone": data["emergencyContactPhone"],
            "temporaryAddress": data["temporaryAddress"],
            "permanentAddress": data["permanentAddress"],
            "occupation": data["occupation"],
            "otherOccupation": data["otherOccupation"],
            "workLocation": data["workLocation"]
        }

        # Save data to Firestore
        db.collection("users").document(user_record.uid).set(user_data)

        # ✅ NOTE: Firebase Admin SDK does NOT send email verification
        # You must use client-side code for that
        return jsonify({"message": "User registered successfully"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 400


# ✅ Run server
if __name__ == "__main__":
    app.run(debug=True)
