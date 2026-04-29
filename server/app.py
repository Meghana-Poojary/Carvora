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
import os

# Update CORS to accept your Render client URL
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # local dev
    "http://localhost:5173",  # Vite dev
    os.getenv("FRONTEND_URL", "https://carvora-app.onrender.com")  # Production
]

CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

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

# Get HF_TOKEN from environment
hf_token = os.getenv("HF_TOKEN")

# Download model from Hugging Face Hub
print("📥 Downloading model from Hugging Face Hub...")
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

IMG_SIZE = 224

@app.route("/predict", methods=["POST"])
def predict():
    temp_path = None
    try:
        print("📩 Request received")

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

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
        })

    except Exception as e:
        print("🔥 ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)