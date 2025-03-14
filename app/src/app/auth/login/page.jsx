"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === "TEACHER") router.push(`/teacher/${user.teacher_id}`);
            else if (user.role === "STUDENT") router.push(`/student/${user.student_id}`);
            else if (user.role === "ALUMNI") router.push(`/alumni/${user.alumni_id}`);
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

            localStorage.setItem("user", JSON.stringify(data));

            toast({
                title: "Login Successful",
                description: `Welcome, ${username}! Redirecting...`,
            });

            if (data.role === "STUDENT" && data.student_id) router.push(`/student/${data.student_id}`);
            else if (data.role === "TEACHER" && data.teacher_id) router.push(`/teacher/${data.teacher_id}`);
            else if (data.role === "ALUMNI" && data.alumni_id) router.push(`/alumni/${data.alumni_id}`);
            else setError("Unauthorized role or missing ID");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-indigo-600">
            {/* Left Side - App Info */}
            <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: showLogin ? "50%" : "100%" }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-600 text-white flex flex-col justify-center items-center p-10"
            >
                <h1 className="text-4xl font-bold text-ceter">Welcome to UNIVERSE</h1>
                <p className="mt-4 text-lg text-center">Manage curricular, co-curricular,extracurricular and alumni activities all in one place.</p>
                {!showLogin && (
                    <Button 
                        onClick={() => setShowLogin(true)} 
                        className="mt-6 bg-white text-indigo-600 font-semibold hover:bg-gray-200 transition"
                    >
                        Login
                    </Button>
                )}
            </motion.div>

            {/* Right Side - Login Form (Animated) */}
            <AnimatePresence>
                {showLogin && (
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 150, damping: 20 }}
                        className="flex-grow flex justify-center items-center bg-indigo-600 text-white"
                    >
                        <Card className="w-full max-w-sm p-6 bg-indigo-500 text-white shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-center text-2xl">Login</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {error && (
                                    <Alert variant="destructive" className="mb-4 bg-red-500 text-white">
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="text-black bg-slate-100"
                                        required
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="text-black bg-slate-100"
                                        required
                                    />
                                    <Button type="submit" className="w-full text-md bg-indigo-900 text-indigo-100 font-semibold hover:bg-indigo-800">
                                        Login
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
