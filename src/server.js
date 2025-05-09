require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB  = require('../config/db');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

// Import đúng spec từ file swagger.js
const swaggerSpecs = require('../swagger.js');

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware cơ bản
app.use(helmet());
app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});
