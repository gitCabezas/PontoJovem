
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();


const fixedFetch = (url, options = {}) => {
  if (options && options.body && !options.duplex) {
    options.duplex = "half";
  }
  return fetch(url, options);
};


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: { fetch: fixedFetch },
  }
);

export default supabase;
