"use client"
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function App() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/map");
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 px-6 py-16 md:py-0">
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="animate-float">
          <Image src="/il1.svg" alt="Illustration" width={400} height={400} priority />
        </div>
      </div>

      <div className="md:w-1/2 text-center md:text-left px-4 md:px-12 mt-20 sm:mt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Locatr</h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
          A dynamic map-based application that helps you explore locations with ease.
        </p>
        <div className="mt-5">
          <Button variant="default" size="lg" onClick={handleClick}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
