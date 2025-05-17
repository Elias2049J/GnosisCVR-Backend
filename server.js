import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import { insertForm, selectForm } from './formController.js';
import { createUser, getAllUsers } from './userController.js';
import { loginAdmin, requireAdmin } from './authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: ['https://gnosiscvr.com', 'https://www.gnosiscvr.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(json());

app.get('/health', (_, res) => {
    res.status(200).send('Server is running');
});

app.get('/test-env', (_, res) => {
    res.json({
        supabaseUrlExists: !!process.env.SUPABASE_URL,
        supabaseKeyExists: !!process.env.SUPABASE_KEY
    });
});

//endpoint para insertar forms
app.post('/save-form', async (req, res) => {
    try {
        const result = await insertForm(req.body);
        console.log('Formulario guardado correctamente en Supabase', result);
        res.status(200).send("Formulario guardado correctamente");
    } catch (err) {
        console.error('Error interno del servidor:', err);
        res.status(500).send("Error interno del servidor");
    }
});

//endpoint para consultar forms
app.get('/admin/forms', requireAdmin, async (_, res) => {
    try {
        const forms = await selectForm();
        res.status(200).json(forms);
        console.log('Formularios obetnidos con éxito');
    } catch (error) {
        console.error('Error al obtener forms:', error);
        res.status(500).json({ error: 'Error al obtener forms' })
    }
});

//endpoint para insertar usuarios
app.post('/save-user', async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    console.log('Usuario guardado correctamente');
    res.status(200).send("Formulario guardado correctamente");
  } catch (err) {
    console.error('Error interno del servidor:', err);
    res.status(500).send("Error interno del servidor");
  }
});


app.post('/login-admin', loginAdmin);

app.get('/admin/users', requireAdmin, async (_, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' })
    }
});

app.patch('/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, active } = req.body;
        const updated = await updateUser(id, { role, active });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
    console.log(`CORS habilitado para: ${corsOptions.origin.join(', ')}`);
});