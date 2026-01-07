import express from 'express';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoutes.js';
import adminRoute from './routes/adminRoutes.js';

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(path.dirname(__dirname), 'frontend');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(frontendPath));

// Route for Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'views',  'index.html'));
});

// Routes for Authentication
app.use('/auth', authRoute);

// Routes for User
app.use('/user', userRoute);

// Routes for Admin
app.use('/admin', adminRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
