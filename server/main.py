from fastapi import FastAPI, File, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from io import StringIO

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://data-cleaner.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Read the uploaded CSV file
        csv_data = await file.read()
        df = pd.read_csv(StringIO(csv_data.decode('latin-1')), engine='python')

        # Get the number of rows and columns
        num_rows = len(df)
        num_columns = len(df.columns)

        # Count the total number of missing values
        total_missing_values = int(df.isnull().sum().sum())

        # Count the number of duplicate rows
        num_duplicates = int(df.duplicated().sum())

        # Define your criteria for outliers and count them
        # For example, let's say an outlier is a row where any numerical value is more than 3 standard deviations from the mean
        threshold = 3
        numerical_columns = df.select_dtypes(include=['number']).columns
        outliers = (df[numerical_columns] - df[numerical_columns].mean()
                    ).abs() > threshold * df[numerical_columns].std()
        num_outliers = int(outliers.any(axis=1).sum())

        # Serialize the head of the DataFrame to JSON
        df_head_json = df.head().to_json(orient='records')

        # Return the statistics and the head of the DataFrame as a JSON response
        return JSONResponse(content={
            "success": True,
            "message": "File uploaded successfully",
            "statistics": {
                "num_rows": num_rows,
                "num_columns": num_columns,
                "total_missing_values": total_missing_values,
                "num_duplicates": num_duplicates,
                "num_outliers": num_outliers
            },
            "head": df_head_json
        })
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/clean")
async def clean_data(
    file: bytes = File(...),
    missingValueStrategy: str = "ignore",
    outlierStrategy: str = "ignore",
):
    try:
        # Read the uploaded CSV file
        df = pd.read_csv(StringIO(file.decode('latin-1')))

        # Define a dictionary to map the missing value strategy to the corresponding function
        strategy_mapping = {
            "drop": lambda df: df.dropna(how='any'),
            "fill": lambda df: df.fillna(method='ffill').fillna(value=0),
            "interpolate": lambda df: df.interpolate(method='linear')
        }

        # Apply the chosen missing value strategy or return the original DataFrame
        cleaned_df = strategy_mapping.get(
            missingValueStrategy, lambda df: df)(df)

        # Handle outliers based on the chosen strategy
        if outlierStrategy == "drop":
            # Define your criteria for outliers and drop them
            # For example, let's say an outlier is a row where any numerical value is more than 3 standard deviations from the mean
            threshold = 3
            numerical_columns = cleaned_df.select_dtypes(
                include=['number']).columns
            outliers = (cleaned_df[numerical_columns] - cleaned_df[numerical_columns].mean(
            )).abs() > threshold * cleaned_df[numerical_columns].std()
            cleaned_df = cleaned_df[~outliers.any(axis=1)]

        elif outlierStrategy == "winsorize":
            # Winsorize outliers to a specified percentile
            winsorize_percentile = 0.95  # Set the desired percentile
            numerical_columns = cleaned_df.select_dtypes(
                include=['number']).columns
            for column in numerical_columns:
                lower_limit, upper_limit = cleaned_df[column].quantile(
                    [winsorize_percentile, 1 - winsorize_percentile])
                cleaned_df.loc[cleaned_df[column] <
                               lower_limit, column] = lower_limit
                cleaned_df.loc[cleaned_df[column] >
                               upper_limit, column] = upper_limit

        # Convert the cleaned DataFrame back to CSV format
        cleaned_csv = cleaned_df.to_csv(index=False)
        return Response(content=cleaned_csv, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=cleaned_data.csv"})
    except Exception as e:
        return {"success": False, "message": str(e)}
