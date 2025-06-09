-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tools table
CREATE TABLE tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create votes table with enum type for vote_type
CREATE TYPE vote_type AS ENUM ('up', 'down');

CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Add unique constraint to prevent multiple votes from same user on same tool
    UNIQUE(user_id, tool_id)
);

-- Create view for tool vote counts
CREATE VIEW tool_vote_counts AS
SELECT 
    t.id as tool_id,
    t.name as tool_name,
    COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as upvotes,
    COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as downvotes,
    COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) - 
    COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as vote_score
FROM tools t
LEFT JOIN votes v ON t.id = v.tool_id
GROUP BY t.id, t.name;

-- Add Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users can read all tools
CREATE POLICY "Tools are viewable by everyone" ON tools
    FOR SELECT USING (true);

-- Users can read all vote counts
CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

-- Users can only vote if authenticated
CREATE POLICY "Users can insert their own votes" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id); 