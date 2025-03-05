"use client"
import { useEffect, useState } from 'react';

const Loading = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Delay time in milliseconds (e.g., 3000ms = 3 seconds)
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (showContent) {
    return <div>Content Loaded!</div>;
  }

  return <div className="h-screen w-screen flex item-center justify-center">
  <img src="/1png.png" className="w-20 h-20 " alt="" />
</div>;
};

export default Loading;
