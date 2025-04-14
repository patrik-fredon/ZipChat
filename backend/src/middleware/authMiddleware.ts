import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'Chybí autorizační token' });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Neplatný autorizační token' });
            return;
        }

        try {
            const decoded = verify(token, process.env.JWT_SECRET as string);
            req.user = decoded;
            next();
        } catch (error) {
            logger.error('Chyba při ověřování tokenu:', error);
            res.status(401).json({ error: 'Neplatný autorizační token' });
        }
    } catch (error) {
        logger.error('Chyba v autentizačním middleware:', error);
        res.status(500).json({ error: 'Chyba při autentizaci' });
    }
}; 