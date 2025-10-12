// app.js
import express from 'express';
import routesUser from './routes/routesUser.js';
import passwordRoutes from './routes/passwordRoutes.js'; // ← Adicione esta importação

const app = express();

import cors from 'cors';
app.use(cors());


app.use(express.json());
app.use('/bk-mobile', routesUser);
app.use('/bk-mobile', passwordRoutes); // ← Adicione esta linha

export default app;