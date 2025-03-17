"use client";
import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatComponent = ({ clubId, eventId, userId, isLeader }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch previous messages
    axios.get(`http://localhost:8000/noti/event/${eventId}/chat/`)
      .then(response => setMessages(response.data.messages))
      .catch(error => console.error("Error fetching messages:", error));

    // Initialize Pusher
    const pusher = new Pusher("d35d4c488b32e53913fd", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(`event_${eventId}_chat`);
    channel.bind("new-message", (data) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom(); // Auto-scroll to the latest message
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post("http://localhost:8000/noti/event/chat/send/", {
        club_id: clubId,
        event_id: eventId,
        sender_id: userId,
        message: newMessage,
      });
      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="m-0 border rounded-2xl shadow-lg">
      <CardHeader className=" text-slate-500 p-4 rounded-t-2xl">
        <CardTitle className="text-lg font-semibold">Event Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-72 overflow-y-auto border rounded-lg p-3 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex mb-2 ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs p-3 rounded-lg shadow-md text-sm ${msg.sender_id === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                  <p className="font-semibold">{msg.sender_name}</p>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {
            isLeader && (
                <div className="mt-4 flex gap-2">
                    <Input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type your message..."
                        className="flex-1"
                    />
                    <Button onClick={sendMessage} className="bg-blue-600 text-white">Send</Button>
                </div>
            )
        }
      </CardContent>
    </Card>
  );
};

export default ChatComponent;
