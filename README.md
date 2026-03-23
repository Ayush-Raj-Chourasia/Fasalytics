# 🌱 Fasalytics — AI-Powered Crop Health Monitoring Platform

> A modern, intelligent platform for agricultural monitoring using AI/ML and real-time sensor data analysis.

---

## 👥 Team Inquisitor

| Name | Role |
|------|------|
| **Keshav Jha** | Team Leader & Frontend |
| **Ayush Raj Chourasia** | Full Stack |
| **Pratikhya Panda** | ML / AI Dev |
| **Priyanshu Pratik** | ML / AI Dev |
| **Diasha Kar** | Pitching & Documentation |

---

## Overview

Fasalytics is a comprehensive crop health monitoring system that combines:
- **React Frontend** - Modern, responsive user interface designed specifically for farmers and agricultural researchers
- **Django Backend** - Robust API for data processing and AI model inference
- **AI/ML Models** - Advanced prediction engines for crop stress detection and health analysis
- **Real-time Analytics** - Dashboard with statistics, trends, and actionable insights

## 🎯 Key Features

### For Farmers & Researchers
- 📊 **Real-time Crop Monitoring** - Track crop health with sensor data
- 🤖 **AI-Powered Analysis** - Advanced ML models detect crop stress patterns
- 🗺️ **Zone Mapping** - Identify problem areas within your field
- 📈 **Historical Trends** - Analyze crop health over time
- 📋 **Detailed Reports** - Export analysis results as professional PDFs
- 🌾 **Expert Recommendations** - Get actionable advice for crop management

### For Developers
- ⚡ **Modern Stack** - React + Vite on frontend, Django RestFramework on backend
- 🔄 **RESTful API** - Well-documented JSON API
- 🎨 **Agricultural Theme** - Beautiful, purpose-built UI design
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🧪 **Production Ready** - Tested and optimized for deployment

## 📊 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API toolkit
- **PyTorch** - ML inference
- **Scikit-learn** - ML algorithms
- **ReportLab** - PDF generation
- **SQLite** - Database (development)

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Git

### Backend Setup (Terminal 1)

```bash
# Clone repository
git clone https://github.com/Ayush-Raj-Chourasia/Fasalytics.git
cd Fasalytics

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirement.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
# Backend runs on http://localhost:8000
```

### Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

Open http://localhost:3000 in your browser!

## 📁 Project Structure

```
Fasalytics/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components (Home, Dashboard, Analyze, etc)
│   │   ├── components/         # Reusable UI components
│   │   ├── styles/             # CSS stylesheets
│   │   ├── api/               # API client configuration
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── index.html             # HTML template
│
├── backend/                    # Django application
│   ├── settings.py            # Django configuration
│   ├── urls.py               # API routes
│   ├── wsgi.py               # WSGI config for deployment
│   └── asgi.py               # ASGI config for async
│
├── main/                      # Django main app
│   ├── models.py             # Database models (CropAnalysis, ContactMessage)
│   ├── views.py              # API endpoints
│   ├── forms.py              # Form definitions
│   ├── urls.py               # Route mappings
│   └── migrations/           # Database migrations
│
├── manage.py                 # Django CLI
├── requirement.txt           # Python dependencies
├── SETUP_DEPLOYMENT.md       # Setup and deployment guide
└── README.md                # This file
```

## 🔌 API Endpoints

### Analysis
```
POST   /api/analyze/                    # Analyze crop (sensor data or image)
GET    /api/results/{id}/               # Get analysis results
GET    /api/history/                    # Get analysis history
GET    /api/dashboard/                  # Get dashboard statistics
GET    /api/export/pdf/{id}/            # Export analysis as PDF
```

### Contact
```
POST   /api/contact/submit/             # Submit contact form
```

## 🎨 Frontend Pages

### Home Page
- Landing page showcasing features
- Call-to-action buttons for analysis and dashboard
- Feature cards explaining capabilities
- How it works section

### Dashboard
- KPI cards (total analyses, healthy, stressed, confidence)
- Analysis trends chart (bar chart)
- Health status distribution (pie chart)
- Real-time statistics

### Analyze Page
- Two analysis methods: sensor data or image upload
- Input fields for sensor readings
- Form validation with helpful hints
- Image preview before upload

### History Page
- List of all past analyses
- Sorting options (recent, confidence)
- Quick access to results
- Status indicators (healthy/stressed)

### Results Page
- Detailed analysis results
- Environmental conditions display
- Zone-based health status
- Export to PDF
- Action recommendations

## 🎯 Usage Examples

### Analyzing with Sensor Data
1. Navigate to Analyze page
2. Select "Sensor Data" tab
3. Enter readings:
   - Soil Moisture: 45-55% (optimal)
   - Temperature: 20-25°C (optimal)
   - Humidity: 60-80% (optimal)
   - pH Level: 6-7 (optimal)
4. Click "Analyze Crop Health"
5. View results and recommendations

### Analyzing with Image
1. Navigate to Analyze page
2. Select "Field Image" tab
3. Upload crop field image (JPG, PNG, WebP)
4. Click "Analyze Image"
5. Get detailed analysis results

## 🚀 Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates optimized build in frontend/dist/
```

### Deploy Options

**Option 1: Heroku**
```bash
heroku login
heroku create your-app-name
git push heroku main
```

**Option 2: Vercel (Frontend Only)**
```bash
# Deploy React build to Vercel
npm run build
vercel
```

**Option 3: Docker**
```bash
docker build -t fasalytics .
docker run -p 8000:8000 fasalytics
```

See [SETUP_DEPLOYMENT.md](SETUP_DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Security

- CORS properly configured
- CSRF protection enabled
- Environment variables for secrets
- Input validation on all forms
- SQL injection prevention via Django ORM

**Production Checklist:**
- [ ] Set `DEBUG = False`
- [ ] Generate new `SECRET_KEY`
- [ ] Use HTTPS only
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up environment variables
- [ ] Enable database backups
- [ ] Monitor API usage

## 🧪 Testing

### Test Sensor Data
```json
{
  "soil_moisture": 50,
  "temperature": 23,
  "humidity": 70,
  "leaf_wetness": 0.5,
  "ph_level": 6.8
}
```

### Test with cURL
```bash
curl -X POST http://localhost:8000/api/analyze/ \
  -H "Content-Type: application/json" \
  -d '{"soil_moisture": 50, "temperature": 23, "humidity": 70, "leaf_wetness": 0.5, "ph_level": 6.8}'
```

## 📊 Data Models

### CropAnalysis
- `soil_moisture` - Soil moisture percentage (0-100)
- `temperature` - Air temperature in Celsius
- `humidity` - Air humidity percentage (0-100)
- `leaf_wetness` - Leaf wetness indicator
- `ph_level` - Soil pH level (0-14)
- `prediction_status` - Health status (healthy/stressed)
- `confidence` - Prediction confidence score
- `recommendation` - AI-generated recommendations
- `stress_reason` - Reason for stress (if any)
- `zone_map` - Field zone health status
- `created_at` - Analysis timestamp

### ContactMessage
- `name` - Contact person name
- `email` - Email address
- `message` - Contact message
- `created_at` - Submission timestamp

## 🐛 Troubleshooting

### CORS Error
```
Solution: Ensure frontend URL is in CORS_ALLOWED_ORIGINS in settings.py
```

### Port Already in Use
```bash
# Frontend: Change in vite.config.js
# Backend: python manage.py runserver 8001
```

### Database Locked
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
```

### Module Not Found
```bash
# Backend
pip install -r requirement.txt

# Frontend
npm install
```

## 📚 Documentation

- [Setup & Deployment Guide](SETUP_DEPLOYMENT.md)
- [API Documentation](docs/API.md) - TBD
- [Architecture Guide](docs/ARCHITECTURE.md) - TBD

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 📧 Contact & Support

- **GitHub Issues** - Report bugs and request features
- **Email** - support@fasalytics.com
- **Website** - https://fasalytics.com (coming soon)

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Django Documentation](https://docs.djangoproject.com)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [REST API Best Practices](https://restfulapi.net)

## 🙏 Acknowledgments

- Built with ❤️ for farmers and agricultural researchers
- Powered by modern AI/ML technologies
- Inspired by the need for sustainable agriculture

---

**Version:** 1.0.0  
**Last Updated:** March 2026  
**Status:** Production Ready ✅  
**Team:** Inquisitor

Made with 🌱 for a greener future

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


