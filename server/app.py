from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tflite_runtime.interpreter as tflite
from PIL import Image
import tempfile
import os
import json
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

CORS(app,
     origins=[
         "http://localhost:3000",
         "http://localhost:5173",
         "https://carvora-app.onrender.com"
     ],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"]
)

print("✅ Flask app initialized")

# Global variables for lazy loading
tflite_interpreter = None
class_names = None
hf_token = os.getenv("HF_TOKEN")

def load_tflite_model_and_classes():
    """Lazy load TFLite model and class names to save memory on startup"""
    global tflite_interpreter, class_names
    
    if tflite_interpreter is not None:
        return  # Already loaded
    
    print("📥 Loading TFLite model and classes...")
    
    try:
        try:
            model_path = hf_hub_download(
                repo_id="MeghanaVP/car-subtype-classifier",
                filename="final_cars.tflite",
                cache_dir="./models",
                token=hf_token
            )
            print(f"✅ TFLite model downloaded from HF: {model_path}")
        except Exception as e:
            print(f"⚠️ Failed to download TFLite from HF: {e}")
            model_path = "final_cars.tflite"
            if not os.path.exists(model_path):
                raise FileNotFoundError("TFLite model not found. Please upload final_cars.tflite to HuggingFace.")

        # Load TFLite interpreter ✅
        tflite_interpreter = tflite.Interpreter(model_path=model_path)
        tflite_interpreter.allocate_tensors()
        print(f"✅ TFLite model loaded successfully")

        with open("class_names.json", "r") as f:
            class_names = json.load(f)
        
        print("✅ Classes loaded successfully")
        
    except Exception as e:
        print(f"🔥 CRITICAL: Failed to load model/classes: {e}")
        import traceback
        traceback.print_exc()
        raise

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Carvora API is running", "endpoints": ["/predict", "/health"]}), 200

IMG_SIZE = 224

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return "", 200
        
    temp_path = None
    try:
        print("📩 Request received")
        
        try:
            load_tflite_model_and_classes()
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            return jsonify({"error": f"Model loading failed: {str(e)}"}), 503
        
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Save temp file
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        temp.close()
        file.save(temp.name)
        temp_path = temp.name

        # Prepare input ✅ using PIL instead of keras
        img = Image.open(temp_path).resize((IMG_SIZE, IMG_SIZE)).convert("RGB")
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)

        # Run inference
        input_details = tflite_interpreter.get_input_details()
        output_details = tflite_interpreter.get_output_details()

        tflite_interpreter.set_tensor(input_details[0]['index'], img_array)
        tflite_interpreter.invoke()

        predictions = tflite_interpreter.get_tensor(output_details[0]['index'])[0]

        predicted_index = int(np.argmax(predictions))
        predicted_class = class_names[predicted_index]
        confidence = float(np.max(predictions) * 100)

        print(f"✅ {predicted_class} ({confidence:.2f}%)")

        return jsonify({
            "prediction": predicted_class,
            "confidence": round(confidence, 2)
        }), 200

    except Exception as e:
        print("🔥 ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

print("✅ App initialized and ready for requests")