import { createClient } from "@supabase/supabase-js";
import config from "../config_prod";

const supabaseUrl = config.SUPABASE_URL;
const supabaseKey = config.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Service Role Key is missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;