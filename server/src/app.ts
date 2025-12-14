import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import sweetsRoutes from './routes/sweets.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Sweet Shop API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

export default app;
