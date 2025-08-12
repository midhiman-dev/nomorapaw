# NomoraPaw - Pet Name Generator

A beautiful, AI-powered pet name generator built with React frontend and FastAPI backend, integrated with Mistral AI.

## Features

- 🐾 Generate unique pet names based on animal type, traits, and themes
- 🎨 Beautiful, responsive design with Tailwind CSS
- 🤖 AI-powered suggestions using Mistral AI API
- 👍 Interactive rating system for generated names
- 📋 Copy names to clipboard functionality
- 🚀 Production-ready with Docker support

## Project Structure

```
NomoraPaw/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── NameForm.jsx
│   │   │   └── NameList.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── netlify.toml
├── backend/           # FastAPI application
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── README.md
```

## Setup Instructions

### Backend Setup (FastAPI)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Mistral API key
   ```

5. **Run the development server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at http://localhost:8000

### Frontend Setup (React)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:3000

### Docker Deployment (Backend)

1. **Build Docker image:**
   ```bash
   cd backend
   docker build -t nomora-paw-backend .
   ```

2. **Run container:**
   ```bash
   docker run -d -p 8000:8000 --env-file .env nomora-paw-backend
   ```

## API Documentation

### POST /api/generate-names

Generate pet names based on provided criteria.

**Request Body:**
```json
{
  "animal": "dog",
  "traits": ["playful", "gentle"],
  "theme": "mythology",
  "num_names": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "name": "Apollo",
      "reason": "Perfect for a playful dog with gentle nature, inspired by the Greek god of light and music"
    }
  ]
}
```

## Environment Variables

### Backend (.env)
- `MISTRAL_API_KEY`: Your Mistral AI API key (required)
- `ENV`: Environment (development/production)
- `DEBUG`: Debug mode (True/False)

## Technologies Used

### Frontend
- React 18
- Tailwind CSS
- Lucide React (icons)
- Vite (build tool)

### Backend  
- FastAPI
- Uvicorn (ASGI server)
- httpx (HTTP client)
- Pydantic (data validation)
- Mistral AI API integration

## Deployment

### Frontend (Netlify)
The `netlify.toml` file is configured for easy deployment to Netlify with API proxy.

### Backend (Docker/Heroku/Railway)
Use the provided Dockerfile for containerized deployment to any cloud platform.

## Development Notes

- The frontend currently uses mock data for development
- Replace the mock API calls in `App.jsx` with actual backend endpoints
- Ensure CORS is properly configured for your deployment domains
- Add proper error handling and user feedback for production use

## Getting Mistral AI API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Add it to your backend `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details