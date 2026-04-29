from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import keras
from keras import layers
from keras.utils import load_img, img_to_array
import tempfile
import os
import json
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Allow requests from frontend
CORS(app, 
     origins=[
         "http://localhost:3000",
         "http://localhost:5173", 
         "https://carvora-app.onrender.com",
         "https://carvora-server.onrender.com"
     ],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type"],
     supports_credentials=True
)

# Register custom Keras layers
@keras.utils.register_keras_serializable(package="Custom")
class CastToFloat32(layers.Layer):
    def call(self, x):
        return tf.cast(x, tf.float32)

    def compute_output_shape(self, input_shape):
        return input_shape

@keras.utils.register_keras_serializable(package="Custom")
class EfficientNetPreprocess(layers.Layer):
    def call(self, x):
        return keras.applications.efficientnet.preprocess_input(x)

    def compute_output_shape(self, input_shape):
        return input_shape

@keras.utils.register_keras_serializable(package="Custom")
class GeMPooling(layers.Layer):
    def __init__(self, p=3.0, **kwargs):
        super().__init__(**kwargs)
        self.p = tf.Variable(p, trainable=True, dtype=tf.float32, name="gem_p")

    def call(self, x):
        x = tf.cast(x, tf.float32)
        return tf.pow(
            tf.reduce_mean(tf.pow(tf.maximum(x, 1e-6), self.p), axis=[1, 2]),
            1.0 / self.p
        )

    def compute_output_shape(self, input_shape):
        return (input_shape[0], input_shape[-1])

    def get_config(self):
        config = super().get_config()
        config.update({"p": float(self.p.numpy())})
        return config

print("✅ Custom layers registered")

# Global variables for lazy loading
model = None
class_names = None
hf_token = os.getenv("HF_TOKEN")

def load_model_and_classes():
    """Lazy load model and class names to save memory on startup"""
    global model, class_names
    
    if model is not None:
        return  # Already loaded
    
    print("📥 Loading model and classes...")
    
    try:
        # Download model from Hugging Face Hub
        try:
            model_path = hf_hub_download(
                repo_id="MeghanaVP/car-subtype-classifier",
                filename="final_cars.keras",
                cache_dir="./models",
                token=hf_token
            )
            print(f"✅ Model downloaded to: {model_path}")
        except Exception as e:
            print(f"⚠️ Failed to download from HF: {e}")
            print("📂 Falling back to local model...")
            model_path = "final_cars.keras"

        # Load model with custom objects
        model = keras.models.load_model(
            model_path,
            custom_objects={
                "CastToFloat32": CastToFloat32,
                "EfficientNetPreprocess": EfficientNetPreprocess,
                "GeMPooling": GeMPooling,
            }
        )
        print("✅ Model loaded successfully")

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
            load_model_and_classes()
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

        img = load_img(temp_path, target_size=(IMG_SIZE, IMG_SIZE))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)[0]

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