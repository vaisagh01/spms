"use client"
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import axios from "axios";

export default function NotificationsPage() {
  const [courseId, setCourseId] = useState("1");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Initialize Pusher
  useEffect(() => {
    if (!courseId) return;

    const pusher = new Pusher("d35d4c488b32e53913fd", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(`course-1`);

    channel.bind("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [courseId]);

  // Fetch existing notifications from the backend
  useEffect(() => {
    if (!courseId) return;

    axios
      .get(`http://127.0.0.1:8000/noti/course-notifications/${courseId}/`)
      .then((response) => {
        if (response.data.status === "success") {
          setNotifications(response.data.notifications);
        }
      })
      .catch((error) => console.error("Error fetching notifications:", error));
  }, [courseId]);

  // Send notification using Axios
  const sendNotification = async () => {
    if (!courseId || !message) {
      alert("Please enter a course ID and message.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/noti/send-course-notification/",
        { course_id: courseId, message },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        setMessage(""); // Clear the input field
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      alert("Error sending notification: " + error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-xl font-bold mb-4">Send Course Notification</h1>

      {/* Input Fields */}
      <input
        type="text"
        placeholder="Enter Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />
      <textarea
        placeholder="Enter Notification Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      ></textarea>
      <button onClick={sendNotification} className="bg-blue-500 text-white px-4 py-2 rounded">
        Send Notification
      </button>

      {/* Notifications List */}
      <h2 className="text-lg font-semibold mt-5">Notifications</h2>
      <ul className="mt-3">
        {notifications.map((notif) => (
          <li key={notif.id} className="border p-2 rounded mb-2">
            <strong>{notif.message}</strong>
            <div className="text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
