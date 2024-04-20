"use client";
import React, { useState } from "react";

const Hero = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [missingValueStrategy, setMissingValueStrategy] = useState("ignore");
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleMissingValueStrategyChange = (e) => {
    setMissingValueStrategy(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("missingValueStrategy", missingValueStrategy);

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

  const handleClean = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("missingValueStrategy", missingValueStrategy);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clean`, {
        method: "POST",
        body: formData,
      });

      // Show the popup if data cleaning is successful
      if (response.ok) {
        setShowPopup(true);
      } else {
        console.error("Data cleaning failed.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDownloadCleanedData = async () => {
    // Download the cleaned CSV file
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("missingValueStrategy", missingValueStrategy);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clean`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "cleaned_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Data cleaning failed.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setShowPopup(false);
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
        <div className="mb-4 md:mb-6 lg:mb-8 mx-auto">
          <label
            className="block text-sm font-semibold mb-2"
            htmlFor="missingValueStrategy"
          >
            Missing Value Strategy:
          </label>
          <select
            id="missingValueStrategy"
            value={missingValueStrategy}
            onChange={handleMissingValueStrategyChange}
            className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer"
          >
            <option value="ignore">Ignore</option>
            <option value="drop">Drop</option>
            <option value="fill">Fill</option>
            <option value="interpolate">Interpolate</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 m-4 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
        >
          Get Summary
        </button>
        <button
          onClick={handleClean}
          className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mt-4"
          disabled={!selectedFile} // Disable button if no file is selected
        >
          Clean
        </button>
      </div>

      {response && (
        <div className="mt-6 mx-8 md:mx-16">
          <h2 className="text-center text-xl font-semibold mb-2">Response</h2>
          <pre className="whitespace-pre-wrap">
            {response.success ? (
              <>
                <p className="font-semibold">Message: {response.message}</p>
                <p className="font-semibold">Statistics:</p>
                <ul>
                  <li>Number of rows: {response.statistics.num_rows}</li>
                  <li>Number of columns: {response.statistics.num_columns}</li>
                  <li>
                    Total missing values:{" "}
                    {response.statistics.total_missing_values}
                  </li>
                  <li>
                    Number of duplicates: {response.statistics.num_duplicates}
                  </li>
                  <li>
                    Number of outliers: {response.statistics.num_outliers}
                  </li>
                </ul>
              </>
            ) : (
              <p className="font-semibold">Error: {response.message}</p>
            )}
          </pre>
        </div>
      )}

      {/* Popup component */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg font-semibold mb-4">
              Your data has been cleaned.
            </p>
            <button
              onClick={handleDownloadCleanedData}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Download Cleaned Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
