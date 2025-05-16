import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export async function createUser(userData) {
    const { pass, ...rest} = userData;
    const hashedPass = await hashPass(pass);
    const userToInsert = {
        ...rest,
        pass: hashedPass
    };

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(userToInsert)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Supabase error: ${errorText}`);
        }

        const data = await response.json();
        console.log('admin creado:', data);
    return data;
    } catch (err) {
        console.error('Error al crear admin: ', err);
        throw err;
    }
}

async function hashPass(pass) {
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(pass, saltRounds);
    return hashedPass;
}

export async function getAllUsers() {
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
        }
    });
    if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
    }
    return await response.json();
}

export async function updateUser(id, { role, active }) {
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;

    const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${id}`,{
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
    });

    if(!response.ok) {
        throw new Error('Error al actualizar usuario');
    }
    return await response.json();
}

export async function getUserByEmail(email) {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
        }
    });
    if (!response.ok) throw new Error('Error al buscar usuario');
    const users = await response.json();
    return users[0];
}