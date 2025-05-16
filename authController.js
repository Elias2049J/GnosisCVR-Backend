import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserByEmail } from './userController.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function loginAdmin(req, res) {
    try {
        const { email, pass } = req.body;
        
        if (!email || !pass) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const user = await getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (user.active === false) {
            return res.status(403).json({ error: 'Esta cuenta ha sido desactivada' });
        }

        const passValid = await bcrypt.compare(pass, user.pass);
        
        if (!passValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            }, 
            JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.status(200).json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
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
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
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