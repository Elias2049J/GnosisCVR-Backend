import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserByEmail } from './userController.js';

dotenv.config();

const JWT_TOKEN = process.env.JWT_TOKEN;

export async function loginAdmin(req, res) {
    try {
        console.log("Login recibido", req.body);
        const { email, pass } = req.body;
        if (!email || !pass) {
            console.log("Faltan datos");
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        console.log("Buscando usuario en Supabase...");
        const user = await getUserByEmail(email);
        console.log("Usuario encontrado:", user);

        if (!user) {
            console.log("Usuario no existe");
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (user.active === false) {
            console.log("Usuario desactivado");
            return res.status(403).json({ error: 'Esta cuenta ha sido desactivada' });
        }

        console.log("Comparando contraseña...");
        const passValid = await bcrypt.compare(pass, user.pass);

        if (!passValid) {
            console.log("Contraseña inválida");
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_TOKEN,
            { expiresIn: '8h' }
        );

        console.log("Login exitoso");
        res.status(200).json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export function requireAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acceso no autorizado' });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, JWT_TOKEN);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        }
        
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Sesión expirada' });
        }
        
        console.error('Error en autenticación:', error);
        res.status(401).json({ error: 'Acceso no autorizado' });
    }
}