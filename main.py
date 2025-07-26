from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Load model
MODEL = tf.keras.models.load_model("app/Models/Project_Improved_Model2.keras")
class_names = ["Bacterial Spot", "Early Blight", "Healthy", "Late Blight", "Southern Blight"]

def tomato_disease_solution(disease):
    solutions = {
        "Bacterial Spot Solution": "...",  # Truncated for brevity
        "Early Blight Solution": "...",
        "Healthy Tomato Maintenance": "...",
        "Late Blight Solution": "...",
        "Southern Blight Solution": "..."
    }
    return solutions.get(disease, "Unknown disease.")

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = read_file_as_image(await file.read())
        image = tf.image.resize(image, (256, 256))
        img_batch = tf.keras.preprocessing.image.img_to_array(image)
        img_batch = tf.expand_dims(img_batch, 0)

        predictions = MODEL.predict(img_batch)
        predicted_class_index = np.argmax(predictions[0])
        predicted_class = class_names[predicted_class_index]
        confidence = round(100 * float(np.max(predictions[0])), 2)
        disease_solution = tomato_disease_solution(f"{predicted_class} Solution")

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "solution": disease_solution
        }

    except Exception as e:
        print("Prediction error:", e)
        return {"error": "Error processing image"}

