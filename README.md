# 🌱 AI Monitored Crop Health

An AI-powered web platform built with **Python Django** that helps monitor crop health using machine learning models and remote sensing techniques. The system allows farmers and researchers to analyze plant health, detect stress, and visualize insights through a user-friendly interface.

---

## 🚀 Features

* 🔍 **Crop Health Monitoring** – Detects crop stress using AI/ML models.
* 🖼️ **Image Analysis** – Supports processing of satellite/drone images.
* 📊 **Data Visualization** – Displays results with charts, maps, and reports.
* 🌐 **Django REST API** – Provides endpoints for integrating with frontend.


---

## 🛠️ Tech Stack

* **Backend:** Python, Django, Django REST Framework
* **AI/ML:**  NumPy, Pandas, OpenCV, PyTorch 
* **Frontend:** HTML,CSS,JAVASCRIPT


---

## 📂 Project Structure

```
final_folder/
│── manage.py
│── requirements.txt
│── main/                 # Django app (models, views, urls, admin)
│── static/               # Static files (CSS, JS) # Uploaded images
│── templates/            # HTML templates                

```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Fasalytics.git
cd Fasalytics
```

### 2. Create and activate virtual environment

```bash
python -m venv venv
# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# On Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create superuser (admin access)

```bash
python manage.py createsuperuser
```

### 6. Start development server

```bash
python manage.py runserver
```

---

## 📊 Usage

1. Upload crop images or datasets via the platform.
2. The AI model analyzes the data and provides **crop health insights**.
3. Visualizations and reports are generated for farmers/researchers.
4. Use REST API endpoints for external integrations.

---

## 🔮 Future Enhancements

* Integration with IoT sensor data.
* Real-time drone/satellite image processing.
* SMS/WhatsApp alerts for farmers.
* Multi-language support for wider adoption.

---

## 👩‍💻 Author

**Ummatul Ayesha**
B.Tech CSE (Cybersecurity) | AI & Full-Stack Enthusiast

---
