from fastapi import FastAPI, File, UploadFile
import pandas as pd
from io import StringIO
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # Add the origin URLs you want to allow
    # You can add more origins if needed
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

        # Find the number of empty values
        empty_value_counts = get_empty_value_counts(df)

        # Additional database information
        num_rows = len(df)
        num_columns = len(df.columns)
        column_names = df.columns.tolist()

        return {
            "success": True,
            "message": "File uploaded successfully",
            "empty_value_counts": empty_value_counts,
            "num_rows": num_rows,
            "num_columns": num_columns,
            "column_names": column_names
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


def get_empty_value_counts(df):
    # Count the number of empty values for each column
    empty_value_counts = df.isnull().sum().to_dict()

    return empty_value_counts
