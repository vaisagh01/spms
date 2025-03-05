"use client";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import { useParams } from "next/navigation";

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const pusher = new Pusher("d35d4c488b32e53913fd", { cluster: "ap2" });
        const channel = pusher.subscribe(`course-1`);

        channel.bind("new-notification", (data) => {
            setNotifications((prev) => [data, ...prev]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    // Function to send notifications
    const sendNotification = async (subject_id, message) => {
        if (!subject_id || !message) return;

        try {
            await axios.post("http://127.0.0.1:8000/noti/send-course-notification/", {
                subject_id: subject_id,
                message,
            }, {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    return { notifications, sendNotification };
};

export default useNotifications;
