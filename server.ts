import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { RecommendationController } from './src/server/controllers/RecommendationController';
import { AuthController } from './src/server/controllers/AuthController';
import { globalErrorHandler } from './src/server/middleware/errorHandler';
import { connectDB } from './src/server/config/database';

async function startServer() {
  const app = express();
  const PORT = 3002;

  // Connect to Database
  await connectDB();

  app.use(express.json());

  // CORS Configuration
  app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3002', 'http://localhost:5173'];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  const recommendationController = new RecommendationController();

  // API Routes
  app.post('/api/auth/signup', AuthController.signup);
  app.post('/api/auth/login', AuthController.login);
  app.post('/api/suggest-crops', recommendationController.handleSuggestion);
  app.post('/api/recommend', recommendationController.handleRecommendation);

  // Global Error Handler (Equivalent to @ControllerAdvice)
  app.use(globalErrorHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
