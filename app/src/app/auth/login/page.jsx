<<<<<<< Updated upstream
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

=======
"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input"; // ShadCN UI
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // ShadCN Alert

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

>>>>>>> Stashed changes
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

<<<<<<< Updated upstream
=======
        // **Validation Check**
>>>>>>> Stashed changes
        if (!username.trim() || !password.trim()) {
            setError("Username and password are required.");
            return;
        }

        try {
            const { data } = await axios.post("http://localhost:8000/curricular/login/", { username, password });

<<<<<<< Updated upstream
            localStorage.setItem("user", JSON.stringify(data));

            toast({
                title: "Login Successful",
                description: `Welcome, ${username}! Redirecting...`,
            });

            if (data.role === "STUDENT" && data.student_id) router.push(`/student/${data.student_id}`);
            else if (data.role === "TEACHER" && data.teacher_id) router.push(`/teacher/${data.teacher_id}`);
            else if (data.role === "ALUMNI" && data.alumni_id) router.push(`/alumni/${data.alumni_id}`);
            else {
                toast({
                    title: "Scheduled: Catch up",
                    description: "Friday, February 10, 2023 at 5:57 PM",
                });
=======
            console.log("User ID:", data.student_id || data.teacher_id);

            // Redirect based on role
            if (data.role === "STUDENT") {
                router.push(`/student/${data.student_id}`);
            } else if (data.role === "TEACHER") {
                router.push(`/teacher/${data.teacher_id}`);
            } else {
                setError("Unauthorized role");
>>>>>>> Stashed changes
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
<<<<<<< Updated upstream
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[url('/landingbg2.webp')] bg-cover">
            {/* Left Side - App Info */}
            <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: showLogin ? "50%" : "100%" }}
                transition={{ duration: 0.5 }}
                className="text-slate-600 flex flex-col justify-center items-center p-6 md:p-10"
            >
                <div className="flex items-center gap-4">
                    <img src="/1png.png" className="w-16 md:w-20" alt="Logo 1" />
                    <img src="/22png.png" className="h-10 md:h-14" alt="Logo 2" />
                </div>

                {!showLogin && (
                    <Button 
                        onClick={() => setShowLogin(true)} 
                        className="mt-6 p-4 md:p-5 bg-amber-400 text-amber-100 font-semibold hover:bg-amber-500 transition"
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
                        className="flex-grow flex justify-center items-center backdrop-blur-sm border-t-2 md:border-l-2 md:border-t-0 border-slate-300 text-white"
                    >
                        <Card className="w-full max-w-xs md:max-w-sm p-6 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl md:text-2xl pb-3 border-b-2 border-slate-300">Login to Continue</CardTitle>
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
=======
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded-lg shadow-lg w-80" onSubmit={handleLogin}>
                <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
                
                {error && (
                    <Alert variant="destructive" className="mb-4 absolute top-0 w-fit left-1/2 transform:translate(-50%,-50%)">
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
>>>>>>> Stashed changes
