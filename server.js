import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

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


app.post('/guardar-form', async (req, res) => {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/forms_prereg`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(req.body)
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('Error al guardar en Supabase:', error);
            return res.status(500).send(error);
        }
        
        console.log('Formulario guardado correctamente en Supabase');
        res.status(200).send("Formulario guardado correctamente");
    } catch (err) {
        console.error('Error interno del servidor:', err);
        res.status(500).send("Error interno del servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
    console.log(`CORS habilitado para: ${corsOptions.origin.join(', ')}`);
});