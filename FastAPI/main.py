from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
# Allow all origins or restrict to your React app's domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow only your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load model
MODEL = tf.keras.models.load_model(r"C:\Users\user\Desktop\david_omeiza_tomato_project\Models\Project_Improved_Model2.keras")
class_names = ["Bacterial Spot", "Early Blight", "Healthy", "Late Blight", "Southern Blight"]

# Tomato disease solution function
def tomato_disease_solution(disease):
    solutions = {
        "Bacterial Spot Solution":
                          "1. Use certified disease-free seeds.\n"
                          "2. Avoid overhead watering to reduce leaf wetness.\n"
                          "3. Apply copper-based bactericides as a preventative measure.\n"
                          "4. Remove and destroy infected plant debris.\n"
                          "5. Maintain proper plant spacing for air circulation.\n",
        "Early Blight Solution":
                        "1. Rotate crops to prevent pathogen buildup in the soil.\n"
                        "2. Use resistant tomato varieties.\n"
                        "3. Remove and destroy affected plant parts.\n"
                        "4. Apply fungicides like chlorothalonil or copper-based sprays.\n"
                        "5. Ensure proper plant spacing for good air circulation.\n",
        "Healthy Tomato Maintenance":
                          "1. Ensure proper watering - water at the base, not overhead.\n"
                          "2. Use mulch to retain soil moisture and prevent soil-borne diseases.\n"
                          "3. Fertilize regularly with balanced nutrients.\n"
                          "4. Prune to promote good air circulation.\n"
                          "5. Monitor plants regularly for any signs of disease or pests.\n",
        "Late Blight Solution":
                       "1. Use resistant tomato varieties.\n"
                       "2. Remove and destroy infected plants immediately.\n"
                       "3. Apply fungicides containing mancozeb or chlorothalonil.\n"
                       "4. Avoid overhead watering to minimize moisture.\n"
                       "5. Practice crop rotation and soil sanitation.\n",
        "Southern Blight Solution":
                           "1. Rotate crops to avoid soilborne pathogens.\n"
                           "2. Apply fungicides such as PCNB (pentachloronitrobenzene).\n"
                           "3. Remove and destroy infected plants and debris.\n"
                           "4. Use deep plowing to bury sclerotia.\n"
                           "5. Maintain proper soil drainage to prevent moisture buildup.\n"
    }
    return solutions.get(disease, "Unknown disease. Please provide a valid disease name.")

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
):
    print(f"Received file: {file.filename}, Content type: {file.content_type}")
    
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
        print("Error in prediction:", e)
        return {"error": "Error in processing the file"}



if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)