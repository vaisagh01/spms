'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";

export default function ResumePage() {
    const params = useParams();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = `http://localhost:8000/resume/generate/${params.student_id}/`;

    useEffect(() => {
        fetch(apiUrl, { method: "GET" })
            .then((response) => response.blob())
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PDF:", error);
                setLoading(false);
            });
    }, [params.student_id]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-2xl p-4 shadow-lg">
                <CardContent>
                    <h1 className="text-2xl font-bold mb-4 text-center">Student Resume</h1>
                    {loading ? (
                        <div className="flex justify-center">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : pdfUrl ? (
                        <>
                            <iframe
                                src={pdfUrl}
                                className="w-full h-[500px] border rounded-md"
                            ></iframe>
                            <div className="flex justify-center mt-4">
                                <a href={pdfUrl} download={`Resume_${params.student_id}.pdf`}>
                                    <Button>
                                        <Download className="mr-2" /> Download Resume
                                    </Button>
                                </a>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-red-500">Failed to load resume.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
