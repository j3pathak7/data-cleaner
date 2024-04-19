from fastapi import FastAPI, File, UploadFile
import pandas as pd
from io import StringIO
from fastapi.middleware.cors import CORSMiddleware

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

        return {
            "success": True,
            "message": "File uploaded successfully",
            "num_rows": num_rows,
            "num_columns": num_columns,
            "total_missing_values": total_missing_values,
            "num_duplicates": num_duplicates,
            "num_outliers": num_outliers
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
