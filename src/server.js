require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB  = require('../config/db');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const redisClient = require('../config/redisClient');

// Import đúng spec từ file swagger.js
const swaggerSpecs = require('../config/swagger');

const app = express();

// Kết nối MongoDB
connectDB();

// Kết nối Redis
redisClient.on('connect', () => {
  console.log('Connected to Redis Cloud');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Middleware cơ bản
app.use(helmet());
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173', // Địa chỉ local của React (Vite)
  'https://your-frontend-domain.com' // Domain production của frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép các request không có origin (vd: mobile app, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Cho phép gửi cookie qua CORS
}));

app.set('trust proxy', true);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // Giới hạn 100 request/IP
});
app.use(limiter);


// Routes chính
app.use('/api', routes);

// Swagger UI trên đường dẫn /api-docs, truyền vào swaggerSpecs chứ không phải openapiDoc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Xử lý lỗi tập trung
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port http://0.0.0.0:${PORT}`);
  console.log(`API documentation available at http://0.0.0.0:${PORT}/api-docs`);
});
