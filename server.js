import dotenv from 'dotenv';
import express, { json } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

app.use(cors({
    origin: 'https://gnosiscvr.com'
}));
app.use(json());

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

        res.status(200).send("Formulario guardado correctamente");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error interno del servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
