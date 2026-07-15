import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fica true quando as variáveis de ambiente não foram preenchidas ainda.
// As telas usam essa flag para mostrar um aviso amigável em vez de travar.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Super José] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. " +
      "Copie .env.example para .env e preencha com os dados do seu projeto Supabase."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const ITEMS_TABLE = "items";
export const IMAGES_BUCKET = "item-images";

export const PLAYERS_TABLE = "players";

// Unidades disponíveis na criação de usuário do ranking.
export const UNITS = [
  "Araçoiaba",
  "Avenida Ipanema",
  "São Bento",
  "Carandá",
  "Mineirão",
  "Altos de Ipanema",
];