import express from 'express';
import cargarRouter from './routes/cargarSemana.router.js';
import sqlRouter from './routes/sql.router.js';
import cors from 'cors';
const PORT = 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use(cors());

app.use('/cargar', cargarRouter);
app.use('/sql', sqlRouter);

// Iniciar el servidor
const httpServer = app.listen(8080,()=>console.log("Servidor iniciado"));
