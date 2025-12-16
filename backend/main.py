import os
import replicate
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import time

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

# MODEL_VERSION = "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34"

MODEL_VERSION = "zsxkib/instant-id:2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789"
# BASE_IMAGE = "base_image.jpg"
OUTPUT_FILE = "output.jpg"


@app.get("/")
def read_root():
    return{"status": "Backend is running", "service": "Face Swap API"}

@app.post("/generate")
async def generate_image(file: UploadFile = File(...)):
    print(f"Received request with file: {file.filename}")
    
    # if not os.path.exists(BASE_IMAGE):
    #     raise HTTPException(status_code=500, detail="Server Error: Base image not found.")
    
    temp_filename = os.path.join(current_dir, f"temp_{int(time.time())}_{file.filename}")
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"File saved temporarily as {temp_filename}")
        print("Sending to replicate...")

        output = None

        with open(temp_filename, "rb") as file_handle:
            output = replicate.run(
                MODEL_VERSION,
                input={
                    "image": file_handle,
                    "prompt": "A cute child, full body shot, standing outside a large traditional European stone building on a sunny day, disney pixar animation style, 3d render, vivid colors, masterpiece, 8k resolution",
                    "negative_prompt": "photo, realism, ugly, low quality, blurred, deformed, distorted, watermark, text",
                    "ip_adapter_scale": 0.8,
                    "guidance_scale": 7,
                }
            )
        
        print("Replicate finished.")
        
        final_url = ""
        
        raw_data = output

        if isinstance(raw_data, list) and len(raw_data) > 0:
            raw_data = raw_data[0]

        if hasattr(raw_data, '__iter__') and not isinstance(raw_data, (str, bytes, list)):
            print("Output is a generator. Consuming...")
            raw_data = b"".join(list(raw_data))

        if isinstance(raw_data, str) and raw_data.startswith("http"):
            final_url = raw_data
            print(f"Model returned URL: {final_url}")
            
        else:
            print(f"Model returned data (Type: {type(raw_data)}). Saving to disk...")
            
            bytes_to_write = raw_data
            if not isinstance(bytes_to_write, bytes):
                try:
                    bytes_to_write = str(raw_data).encode('utf-8')
                except:
                    pass

            with open(OUTPUT_FILE, "wb") as f:
                f.write(bytes_to_write)
            
            final_url = f"http://127.0.0.1:8000/static/{OUTPUT_FILE}?t={int(time.time())}"
            print(f"Saved locally. Serving at: {final_url}")
        return {"url": final_url}
        
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500,  detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)