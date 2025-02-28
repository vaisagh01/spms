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

  return <div>Loading.........asasdasd</div>;
};

export default Loading;
