import dotenv from 'dotenv';
import pool from './bd.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export async function insertForm(formData) {
    const response = await fetch(`${supabaseUrl}/rest/v1/forms_prereg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase error: ${errorText}`);
    }
    return await response.json();
}


export async function selectForm() {
    try {
        const query = 'SELECT * FROM forms_prereg ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        throw new Error("Error al Obtener forms: "+ error.message);
    }
}