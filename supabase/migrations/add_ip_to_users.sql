-- Add IP address column to users table
ALTER TABLE users
ADD COLUMN ip_address TEXT;

-- Add index on ip_address for faster lookups
CREATE INDEX idx_users_ip_address ON users(ip_address);

-- Update RLS policies to allow IP-based access
CREATE POLICY "Users can insert themselves with IP" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own IP record" ON users
    FOR UPDATE USING (ip_address = current_setting('request.headers')::json->>'x-real-ip');

-- Add function to get current IP (fallback for development)
CREATE OR REPLACE FUNCTION get_client_ip() RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.headers', true)::json->>'x-real-ip',
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        '127.0.0.1'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 