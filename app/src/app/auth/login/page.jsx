"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input"; // ShadCN UI
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // ShadCN Alert
import { useToast } from "@/hooks/use-toast";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();
    const { toast } = useToast(); // Use toast hook

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            router.push(user.role === "TEACHER" ? `/teacher/${user.teacher_id}` : `/student/${user.student_id}`);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError("Username and password are required.");
            return;
        }

        try {
            const { data } = await axios.post("http://localhost:8000/curricular/login/", { username, password });

            localStorage.setItem("user", JSON.stringify(data)); // Store user in localStorage

            // Show toast notification on successful login
            toast({
                title: "Login Successful",
                description: `Welcome, ${username}! Redirecting...`,
            });

            // Redirect based on role
            if (data.role === "STUDENT" && data.student_id) {
                router.push(`/student/${data.student_id}`);
            } else if (data.role === "TEACHER" && data.teacher_id) {
                router.push(`/teacher/${data.teacher_id}`);
            } else {
                setError("Unauthorized role or missing ID");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded-lg shadow-lg w-80" onSubmit={handleLogin}>
                <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
                
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-3"
                    required
                />
                
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-3"
                    required
                />

                <Button type="submit" className="w-full mt-2">Login</Button>
            </form>
        </div>
    );
};

export default Login;
