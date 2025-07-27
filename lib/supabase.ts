import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drithqycmhtaerfvhmqy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXRocXljbWh0YWVyZnZobXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjE2NjYsImV4cCI6MjA2ODU5NzY2Nn0.8oGqTiPl4rly_fFKeMMcDDmD4GtHaVHWFWp_xz5Uw6s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
