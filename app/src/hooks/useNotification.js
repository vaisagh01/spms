import { useState, useEffect } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import { useParams } from "next/navigation";

const useSendNotification = () => {
    const [courseId, setCourseId] = useState("1");
    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);

    const params = useParams();
    useEffect(() => {
        if (!params.student_id) return;
    
        axios
          .get(`http://127.0.0.1:8000/curricular/student/${params.student_id}/`) // FIX: Use student_id dynamically
          .then((response) => {
            
            setCourseId(response.data.student.course_id);
          })
          .catch((error) => console.error("Error fetching student details:", error));
        }, [params.student_id]);
        
        useEffect(() => {
          if (!courseId) return;
          
          const pusher = new Pusher("d35d4c488b32e53913fd", { cluster: "ap2" });
          const channel = pusher.subscribe(`course-${courseId}`); // FIX: Use dynamic courseId
          
          channel.bind("new-notification", (data) => {
            setNotifications((prev) => [data, ...prev]);
          });
          
          return () => {
            channel.unbind_all();
            channel.unsubscribe();
          };
        }, [courseId]);
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
    return {sendNotification}
};

export default useSendNotification;
