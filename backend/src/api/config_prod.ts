import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FRONTEND_URL: string;
  PORT: number;
}

if (!process.env.SUPABASE_URL) {
  console.error('SUPABASE_URL is not defined in environment variables!');
  console.error('Current environment:', process.env.NODE_ENV);
  console.error('Current directory:', process.cwd());
}

const config: Config = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://fin-fix.vercel.app' || 'http://localhost:3000',
  PORT: parseInt(process.env.PORT || '8000', 10),
};

export default config;