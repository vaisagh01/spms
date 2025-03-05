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
        const fetchDetails = async () => {
            try {
                let url = "";
                if (params.student_id) {
                    url = `http://127.0.0.1:8000/curricular/student/${params.student_id}/`;
                } else if (params.teacher_id) {
                    url = `http://127.0.0.1:8000/curricular/teacher/${params.teacher_id}/`;
                }

                if (!url) return;

                const response = await axios.get(url);
                setCourseId(response.data.course_id);
            } catch (error) {
                console.error("Error fetching details:", error);
            }
        };

        fetchDetails();
    }, [params.student_id, params.teacher_id]);

    useEffect(() => {
        if (!courseId) return;

        const pusher = new Pusher("d35d4c488b32e53913fd", { cluster: "ap2" });
        const channel = pusher.subscribe(`course-${courseId}`);

        channel.bind("new-notification", (data) => {
            setNotifications((prev) => [data, ...prev]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [courseId]);

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
                setMessage("");
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            alert("Error sending notification: " + error.message);
        }
    };

    return { sendNotification, message, setMessage, notifications };
};

export default useSendNotification;
