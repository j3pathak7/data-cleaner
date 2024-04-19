"use client";
import React, { useState } from "react";
import Response from "./Response";

const Hero = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="h-screen py-10 md:py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 lg:mb-6">
          Upload CSV File
        </h1>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer w-full md:w-auto mb-4 md:mb-6 lg:mb-8 mx-auto"
        />
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
        >
          Upload File
        </button>
      </div>

      {response && <Response response={response} />}
    </div>
  );
};

export default Hero;
