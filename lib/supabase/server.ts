import { createClient } from "@supabase/supabase-js";
import { supabaseFetch } from "./fetch";

const supabaseClientOptions = {
  global: {
    fetch: supabaseFetch,
  },
};

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseClientOptions
  );
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    supabaseClientOptions
  );
}
