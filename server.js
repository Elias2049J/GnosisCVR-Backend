import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import { insertForm, selectForm } from './formController.js';
import { createUser, getAllUsers } from './userController.js';
import { loginAdmin, requireAdmin } from './authController.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_TOKEN = process.env.JWT_TOKEN;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

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

//endpoint para inserciones públicas de forms
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
app.post('/admin/users', requireAdmin, async (req, res) => {
  try {
    res.status(201).json({message: "Usuario creado correctamente" });
    console.log('Usuario creado correctamente en supabase');
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).send("Error interno del servidor");
  }
});

//endpoint para registros públicos
app.post('/register', async (req, res) => {
    try {
        const userData = { ...req.body, role: "user"};
        const newUser = await createUser(userData);

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            JWT_TOKEN,
            { expiresIn: JWT_EXPIRATION}
        );

        res.status(200).json({
            message: "Usuario registrado con éxito",
            token,
            user: { id: newUser.id, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error('Error al registrar usuario', error);
        res.status(500).send("Error interno del servidor");
    }
});

//endpoint para login de admin
app.post('/login-admin', loginAdmin);

//endpoint para consultar usuarios
app.get('/admin/users', requireAdmin, async (_, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' })
    }
});

//endpoint para editar usuarios
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

//puerto de escucha de express
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto: ${PORT}`);
    console.log(`CORS habilitado para: ${corsOptions.origin.join(', ')}`);
});