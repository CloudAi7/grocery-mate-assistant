
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wxwlhycyxdlneumdjdgu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4d2xoeWN5eGRsbmV1bWRqZGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTQxNzcsImV4cCI6MjA1OTA3MDE3N30.onLwz7cLFC6XN20Npx9-fuk7P4LH8rOfsskjTg6qX4U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
