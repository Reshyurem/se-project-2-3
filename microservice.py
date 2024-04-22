# from fastapi import FastAPI, HTTPException, Request
# from pydantic import BaseModel
# import firebase_admin
# from firebase_admin import credentials, firestore, initialize_app
# from fastapi.middleware.cors import CORSMiddleware
# import os

# # Initialize Firebase Admin with your Firebase config (from initialization parameters)
# # Firebase initialization with provided configuration
# # In this case, we are initializing Firebase Admin with specific parameters
# firebase_config = {
#     "apiKey": "AIzaSyA3xL5ioXcPsSLuYy0Tr-aStc5ssNI3g-w",
#     "authDomain": "course-review-fd498.firebaseapp.com",
#     "projectId": "course-review-fd498",
#     "storageBucket": "course-review-fd498.appspot.com",
#     "messagingSenderId": "128569235135",
#     "appId": "1:128569235135:web:7cdc30bb4cfd5ed81a980a",
#     "measurementId": "G-JJV9KP0WBT"
# }
# cred = credentials.Certificate("config.json")
# default_app = initialize_app(cred)

# db = firestore.client()

# # Create FastAPI instance
# app = FastAPI()

# # origins = ['http://localhost:3000', 'https://localhost:3000', 'http://localhost:5173', 'https://localhost:5173']

# # app.add_middleware(
# #     CORSMiddleware,
# #     # allow_origins=origins,
# #     allow_origins=['*'],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # Define Pydantic models for request and response validation
# class SubscriptionRequest(BaseModel):
#     userId: str
#     courseId: str
#     action: str  # 'subscribe' or 'unsubscribe'

# class Notificatio(BaseModel):
#     userId: str
#     message: str
#     courseId: str

# # Subscribe or unsubscribe from a course
# @app.post("/subscribe")
# async def subscribe(request: SubscriptionRequest):
#     try:
#         user_ref = db.collection("users").document(request.userId)
#         user_doc = user_ref.get()

#         if not user_doc.exists:
#             raise HTTPException(status_code=404, detail="User not found")

#         subscribed_courses = user_doc.get("subscribedCourses")

#         if request.action == "subscribe":
#             if request.courseId not in subscribed_courses:
#                 subscribed_courses.append(request.courseId)
#         elif request.action == "unsubscribe":
#             if request.courseId in subscribed_courses:
#                 subscribed_courses.remove(request.courseId)
#         else:
#             raise HTTPException(status_code=400, detail="Invalid action")

#         user_ref.update({"subscribedCourses": subscribed_courses})

#         return {"success": True, "subscribedCourses": subscribed_courses}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
# # Notify all users subscribed to a course
# @app.post("/notify")
# async def notify(request: Notificatio):
#     course_id = request.courseId
#     try:
#         course_ref = db.collection("courses").document(course_id)
#         course_doc = course_ref.get()

#         print("A1")

#         if not course_doc.exists:
#             raise HTTPException(status_code=404, detail="Course not found")
        
#         print("A2")

#         subscribed_users = db.collection("users").where("subscribedCourses", "array_contains", course_id)
#         notifications = []

#         print("A3")

#         for user in subscribed_users.stream():
#             notifications.append({
#                 "userId": user.id,
#                 "message": request.message
#             })

#         print("A4")

#         notifications_ref = db.collection("notifications")
#         for notification in notifications:
#             notifications_ref.add(notification)
        
#         print("A5")

#         return {"success": True, "notifications": notifications}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # Get notifications for a user
# @app.get("/notifications/{user_id}")
# async def get_notifications(user_id: str):
#     try:
#         user_ref = db.collection("users").document(user_id)
#         user_doc = user_ref.get()

#         if not user_doc.exists:
#             raise HTTPException(status_code=404, detail="User not found")

#         notifications_ref = db.collection("notifications").where("userId", "==", user_id)
#         notifications = [notif.to_dict() for notif in notifications_ref.stream()]

#         # Delete notifications after fetching
#         for notif in notifications_ref.stream():
#             notif.reference.delete()

#         return notifications

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # Run the FastAPI server
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, initialize_app
import os

# Initialize Firebase Admin with your Firebase config (from initialization parameters)
firebase_config = {
    "apiKey": "AIzaSyA3xL5ioXcPsSLuYy0Tr-aStc5ssNI3g-w",
    "authDomain": "course-review-fd498.firebaseapp.com",
    "projectId": "course-review-fd498",
    "storageBucket": "course-review-fd498.appspot.com",
    "messagingSenderId": "128569235135",
    "appId": "1:128569235135:web:7cdc30bb4cfd5ed81a980a",
    "measurementId": "G-JJV9KP0WBT"
}
cred = credentials.Certificate("config.json")
default_app = initialize_app(cred)

db = firestore.client()

# Create Flask instance
app = Flask(__name__)

# Configure CORS (cross-origin resource sharing)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Define data models as dictionaries (since Flask doesn't support Pydantic)
class SubscriptionRequest:
    def __init__(self, data):
        self.userId = data.get("userId")
        self.courseId = data.get("courseId")
        self.action = data.get("action")  # 'subscribe' or 'unsubscribe'

class Notification:
    def __init__(self, data):
        self.userId = data.get("userId")
        self.message = data.get("message")
        self.courseId = data.get("courseId")

# Subscribe or unsubscribe from a course
@app.route("/subscribe", methods=["POST"])
def subscribe():
    request_data = request.json
    sub_request = SubscriptionRequest(request_data)

    user_ref = db.collection("users").document(sub_request.userId)
    user_doc = user_ref.get()

    if not user_doc.exists():
        abort(404, "User not found")

    subscribed_courses = user_doc.get("subscribedCourses", [])

    if sub_request.action == "subscribe":
        if sub_request.courseId not in subscribed_courses:
            subscribed_courses.append(sub_request.courseId)
    elif sub_request.action == "unsubscribe":
        if sub_request.courseId in subscribed_courses:
            subscribed_courses.remove(sub_request.courseId)
    else:
        abort(400, "Invalid action")

    user_ref.update({"subscribedCourses": subscribed_courses})

    return jsonify({"success": True, "subscribedCourses": subscribed_courses})

# Notify all users subscribed to a course
@app.route("/notify", methods=["POST"])
def notify():
    request_data = request.json
    notify_request = Notification(request_data)

    # print(notify_request.userId, notify_request.courseId, notify_request.message)

    course_id = notify_request.courseId
    # course_ref = db.collection("courses").document(course_id)
    course_ref = db.collection("courses").where("courseId", "==", notify_request.courseId)
    course_doc = course_ref.get()[0]

    if not course_doc.exists:
        abort(404, "Course not found")

    print(notify_request.userId, notify_request.courseId, notify_request.message)

    subscribed_users = db.collection("users").where("subscribedCourses", "array_contains", course_id)
    notifications = []

    for user in subscribed_users.stream():
        if user.id != notify_request.userId:
            notifications.append({
                "userId": user.id,
                "message": notify_request.message,
                "courseId": notify_request.courseId
            })

    notifications_ref = db.collection("notifications")
    for notification in notifications:
        notifications_ref.add(notification)

    return jsonify({"success": True, "notifications": notifications})

# Get notifications for a user
@app.route("/notifications/<user_id>", methods=["GET"])
def get_notifications(user_id):
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        abort(404, "User not found")

    notifications_ref = db.collection("notifications").where("userId", "==", user_id)
    notifications = [notif.to_dict() for notif in notifications_ref.stream()]

    # Delete notifications after fetching if user id matches
    for notif in notifications_ref.stream():
        if notif.to_dict()["userId"] == user_id:
            notif.reference.delete()

    print(notifications)

    return jsonify(notifications)

# Run the Flask server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
