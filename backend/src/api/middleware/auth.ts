import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';
import config from '../config_prod';
import dotenv from 'dotenv';
dotenv.config();

interface AuthRequest extends Request {
  user?: User;
}

const supabase = createClient(config.SUPABASE_URL!, config.SUPABASE_SERVICE_ROLE_KEY!);

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    req.user = data.user;
    next(); 
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
    return;
  }
};