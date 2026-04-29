from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from keras.utils import load_img, img_to_array
import tempfile
import os
import json
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ⚡ Minimize TensorFlow footprint
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

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
        # Try to download TFLite model from HuggingFace
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
            print("📂 Trying local TFLite model...")
            model_path = "final_cars.tflite"
            
            # If local TFLite doesn't exist, try to convert Keras model
            if not os.path.exists(model_path):
                print("🔄 Converting Keras model to TFLite...")
                keras_path = hf_hub_download(
                    repo_id="MeghanaVP/car-subtype-classifier",
                    filename="final_cars.keras",
                    cache_dir="./models",
                    token=hf_token
                )
                # This requires the original Keras model with custom layers
                # For now, we'll assume TFLite model exists locally
                raise FileNotFoundError("TFLite model not found. Please upload final_cars.tflite to your repo or HuggingFace.")

        # Load TFLite interpreter
        tflite_interpreter = tf.lite.Interpreter(model_path=model_path)
        tflite_interpreter.allocate_tensors()
        print(f"✅ TFLite model loaded successfully from: {model_path}")
        
        # Load class names
        with open("class_names.json", "r") as f:
            class_names = json.load(f)
        
        print("✅ Classes loaded successfully")
        
    except Exception as e:
        print(f"🔥 CRITICAL: Failed to load model/classes: {e}")
        import traceback
        traceback.print_exc()
        raise

# Health check route
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

# Root route
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Carvora API is running", "endpoints": ["/predict", "/health"]}), 200

IMG_SIZE = 224

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    # Handle CORS preflight requests
    if request.method == "OPTIONS":
        return "", 200
        
    temp_path = None
    try:
        print("📩 Request received")
        
        # Lazy load model on first request
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

        # Save temp
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        temp.close()
        file.save(temp.name)
        temp_path = temp.name

        # Prepare input
        img = load_img(temp_path, target_size=(IMG_SIZE, IMG_SIZE))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.astype(np.float32)  # TFLite requires float32

        # Get input/output details
        input_details = tflite_interpreter.get_input_details()
        output_details = tflite_interpreter.get_output_details()

        # Set input tensor
        tflite_interpreter.set_tensor(input_details[0]['index'], img_array)

        # Run inference
        tflite_interpreter.invoke()

        # Get output
        output_data = tflite_interpreter.get_tensor(output_details[0]['index'])
        predictions = output_data[0]

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
    # For local development only
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

print("✅ App initialized and ready for requests")