import os
import replicate
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()


if not os.getenv("REPLICATE_API_TOKEN"):
    raise ValueError("Error: REPLICATE_API_TOKEN is missing from .env file.")


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

current_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=current_dir), name="static")

MODEL_VERSION = "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34"
BASE_IMAGE = "base_image.jpg"
OUTPUT_FILE = "output.jpg"

@app.get("/")
def read_root():
    return{"status": "Backend is running", "service": "Face Swap API"}

@app.post("/generate")
async def generate_image(file: UploadFile = File(...)):
    """
    Receives a user photo, swaps the face onto the base illustration, 
    and returns the Replicate URL.
    """
    print(f"Received request with file: {file.filename}")
    
    if not os.path.exists(BASE_IMAGE):
        raise HTTPException(status_code=500, detail="Server Error: Base image not found.")
    
    temp_filename = f"temp_{file.filename}"
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"File saved temporarily as {temp_filename}")
        print("Sending to replicate...")
        
        output = replicate.run(
            MODEL_VERSION,
            input={
            "input_image": open(BASE_IMAGE, "rb"), 
            "swap_image": open(temp_filename, "rb"),   
            "faces_index": "0",                    
            }
        )
        
        if hasattr(output, '__iter__') and not isinstance(output, list):
            output_data = b"".join(list(output))
        elif isinstance(output, list):
            output_data = output[0]
        else:
            output_data = output

        final_url = ""
        
        if isinstance(output_data, str) and output_data.startswith("http"):
            final_url = output_data
            print(f"Model returned a URL: {final_url}")
        else:
            print("Model returned Raw Bytes. Saving locally...")
            with open(OUTPUT_FILE, "wb") as f:
                if isinstance(output_data, str):
                    pass
                f.write(output_data)
            
            import time
            final_url = f"http://127.0.0.1:8000/static/{OUTPUT_FILE}?t={int(time.time())}"
            print(f"Saved to {OUTPUT_FILE}. Serving at {final_url}")
            
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        return {"url": final_url}
    
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500,  detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)