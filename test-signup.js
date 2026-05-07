const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvmkgvacufblcuuzuexx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bWtndmFjdWZibGN1dXp1ZXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTU2MzYsImV4cCI6MjA5MzQ5MTYzNn0.5M_X7jWcP4_XhLJyi-JzJ_6e38-Mfl1jn3yjhFeVGbw'
);

async function run() {
  const email = `test${Date.now()}@gmail.com`;
  console.log('Attempting to sign up with:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
  });
  
  console.log('Signup Error:', error?.message);
  console.log('Session returned?', !!data?.session);
  console.log('User confirmed at:', data?.user?.email_confirmed_at);
}

run();
