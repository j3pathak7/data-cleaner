import React from "react";

const Response = ({ response }) => {
  return (
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
                Total missing values: {response.statistics.total_missing_values}
              </li>
              <li>
                Number of duplicates: {response.statistics.num_duplicates}
              </li>
              <li>Number of outliers: {response.statistics.num_outliers}</li>
            </ul>
            <p className="font-semibold">Head of the DataFrame:</p>
            <pre>{JSON.stringify(JSON.parse(response.head), null, 2)}</pre>
          </>
        ) : (
          <p className="font-semibold">Error: {response.message}</p>
        )}
      </pre>
    </div>
  );
};

export default Response;
