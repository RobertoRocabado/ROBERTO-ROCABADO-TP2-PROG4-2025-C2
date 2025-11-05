import 'dotenv/config'; // 👈 fuerza a cargar el .env antes de crear el cliente
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  console.error('❌ No se encontró SUPABASE_URL en .env');
  throw new Error('SUPABASE_URL no definida');
}

if (!process.env.SUPABASE_SERVICE_ROLE) {
  console.error('❌ No se encontró SUPABASE_SERVICE_ROLE en .env');
  throw new Error('SUPABASE_SERVICE_ROLE no definida');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

console.log('✅ Supabase conectado correctamente al bucket:', process.env.SUPABASE_BUCKET);


