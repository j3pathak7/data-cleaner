import React from "react";

const DownloadPopup = ({ onDownload }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg font-semibold mb-4">
          Your data has been cleaned.
        </p>
        <button
          onClick={onDownload}
          className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Download Cleaned Data
        </button>
      </div>
    </div>
  );
};

export default DownloadPopup;
