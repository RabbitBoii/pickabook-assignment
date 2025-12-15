import os
import replicate
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


if not os.getenv("REPLICATE_API_TOKEN"):
    raise ValueError("Error: REPLICATE_API_TOKEN is missing from .env file.")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

MODEL_VERSION = "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34"
BASE_IMAGE = "base_image.jpg"

@app.get("/")
def read_root():
    return{"status": "Backend is running", "service": "Face Swap API"}

@app.post("/generate")
async def generate_image(file: UploadFile =File(...)):
    """
    Receives a user photo, swaps the face onto the base illustration, 
    and returns the Replicate URL.
    """
    print(f"Received request with file: {file.filename}")
    
    if not os.path.exists(BASE_IMAGE):
        raise HTTPException(status_code=500, detail="Server Error: Base image not found.")
    
    try:
        output = replicate.run(
        MODEL_VERSION,
        input={
            "input_image": open(BASE_IMAGE, "rb"), 
            "swap_image": open(file.file, "rb"),   
            # "variation": 1,
            "faces_index": "0",                    
        }
    )
        if output:
            result_url = output
            print(f"Success! URL: {result_url}")
            return {"url": result_url}
        else:
            raise HTTPException(status_code=500, detail="Model returned no output.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500,  detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)