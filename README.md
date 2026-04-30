# 🚗 Car Classification Model (196 Classes)

## 📌 Overview

This project implements a deep learning model for **fine-grained car classification** across **196 categories** using **TensorFlow/Keras** and an **EfficientNetB3 backbone**.

The model uses custom preprocessing, advanced pooling (GeM), and strong data augmentation to improve performance.

---

## 🧠 Model Architecture

* Backbone: **EfficientNetB3**
* Input Shape: `(224, 224, 3)`
* Output: `196 classes (softmax)`
* Total Parameters: **11,755,251**

### Key Components:

* Custom Layers:

  * `CastToFloat32`
  * `EfficientNetPreprocess`
  * `GeMPooling`
* Data Augmentation:

  * Random Flip
  * Rotation
  * Zoom
  * Brightness & Contrast adjustment
  * Translation
* Fully Connected Head:

  * Dense → BatchNorm → ReLU → Dropout
  * Final Softmax layer

---

## 📊 Performance

* **Accuracy: 80%**

---

## 📂 Model Details

* Weights file: `final_cars.keras`
* Model is reconstructed programmatically and **weights are loaded separately** to avoid serialization issues with Lambda layers.

---

## 📋 Setup Instructions

### Prerequisites

* Python 3.8+
* TensorFlow/Keras
* Flask (for backend server)
* Node.js & npm (for frontend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   ```

2. **Install dependencies**
   
   **Backend:**
   ```bash
   cd server
   pip install -r requirements.txt
   ```
   
   **Frontend:**
   ```bash
   cd client
   npm install
   ```

3. **Set up Environment Variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   HF_TOKEN=your_huggingface_token_here
   ```
   
   > **Note:** The model is automatically downloaded from Hugging Face Hub on first run.
   > - Get your token from: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

4. **Run the servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   python app.py
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```

---

## ⚙️ Usage

### 1. Load Model

```python
from tensorflow.keras.models import load_model

# Use the provided architecture code
model.load_weights("final_cars.keras")
```

---

### 2. Inference Example

```python
import numpy as np
from tensorflow.keras.preprocessing import image

img = image.load_img("test.jpg", target_size=(224,224))
img = image.img_to_array(img)
img = np.expand_dims(img, axis=0)

predictions = model.predict(img)
print(predictions)
```

---

## 🏗️ How It Works

1. Input image is augmented
2. Converted to float32
3. Preprocessed using EfficientNet preprocessing
4. Passed through EfficientNetB3 backbone
5. Features pooled using **GeM pooling**
6. Fully connected layers perform classification

---

## 💡 Highlights

* Avoids Lambda layer serialization issues using **custom registered layers**
* Uses **GeM pooling** instead of traditional average pooling
* Strong augmentation pipeline improves generalization

---

## 📌 Notes

* Ensure TensorFlow version compatibility when loading weights
* Model expects input images resized to **224×224**
* **Model Hosting:** The model is hosted on Hugging Face Hub at `MeghanaVP/car-subtype-classifier`
* **Automatic Download:** On first run, the model is automatically downloaded from Hugging Face Hub and cached locally in `./models/`
* **HF_TOKEN:** If using a private model, ensure `HF_TOKEN` is set in your `.env` file
* **Performance:** After the initial download, subsequent runs load the model from cache instantly

---

## 👤 Author

Meghana Poojary
