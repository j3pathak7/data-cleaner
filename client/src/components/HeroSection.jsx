"use client";
import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";

const Hero = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [missingValueStrategy, setMissingValueStrategy] = useState("ignore");
  const [outlierStrategy, setOutlierStrategy] = useState("ignore");
  const [duplicateStrategy, setDuplicateStrategy] = useState("ignore");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleMissingValueStrategyChange = (e) => {
    setMissingValueStrategy(e.target.value);
  };

  const handleOutlierStrategyChange = (e) => {
    setOutlierStrategy(e.target.value);
  };

  const handleDuplicateStrategyChange = (e) => {
    setDuplicateStrategy(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleClean = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clean?missingValueStrategy=${missingValueStrategy}&outlierStrategy=${outlierStrategy}&duplicateStrategy=${duplicateStrategy}`,
        {
          method: "POST",
          body: formData,
        }
      );

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
  };

  return (
    <div className="h-screen py-10 md:py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold my-18 md:my-16">
          Upload CSV File
        </h1>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer w-full md:w-auto mb-4 md:mb-6 lg:mb-8 mx-auto"
        />
        <div className="mb-4 md:mb-6 lg:mb-8 mx-auto flex flex-wrap justify-center gap-4">
          <div className="w-full sm:w-auto">
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
              className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer w-full"
            >
              <option value="ignore">Ignore</option>
              <option value="drop">Drop</option>
              <option value="fill">Fill</option>
              <option value="interpolate">Interpolate</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="outlierStrategy"
            >
              Outlier Strategy:
            </label>
            <select
              id="outlierStrategy"
              value={outlierStrategy}
              onChange={handleOutlierStrategyChange}
              className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer w-full"
            >
              <option value="ignore">Ignore</option>
              <option value="drop">Drop</option>
              <option value="winsorize">Winsorize</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="duplicateStrategy"
            >
              Duplicate Strategy:
            </label>
            <select
              id="duplicateStrategy"
              value={duplicateStrategy}
              onChange={handleDuplicateStrategyChange}
              className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer w-full"
            >
              <option value="ignore">Ignore</option>
              <option value="drop">Drop</option>
            </select>
          </div>
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
          disabled={!selectedFile}
        >
          Clean & Download
        </button>
      </div>

      {isLoading ? (
        <div className="mt-6 mx-8 md:mx-16 flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-center text-xl font-semibold">Loading...</p>
        </div>
      ) : (
        response && (
          <div className="mt-6 mx-8 md:mx-16">
            <h2 className="text-center text-xl font-semibold mb-2">Summary</h2>
            <pre className="whitespace-pre-wrap">
              {response.success ? (
                <>
                  <p className="font-semibold">Statistics:</p>
                  <ul>
                    <li>Number of rows: {response.statistics.num_rows}</li>
                    <li>
                      Number of columns: {response.statistics.num_columns}
                    </li>
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
        )
      )}
    </div>
  );
};

export default Hero;
