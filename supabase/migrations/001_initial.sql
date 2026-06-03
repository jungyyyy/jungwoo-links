-- Profile table
CREATE TABLE profile (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Jungwoo Lee',
  bio TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'dark',
  social_tiktok TEXT NOT NULL DEFAULT '',
  social_instagram TEXT NOT NULL DEFAULT '',
  social_linkedin TEXT NOT NULL DEFAULT '',
  social_youtube TEXT NOT NULL DEFAULT '',
  social_twitter TEXT NOT NULL DEFAULT ''
);

-- Sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0
);

-- Links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  emoji TEXT NOT NULL DEFAULT '🔗',
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link clicks table
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_sections_order ON sections(order_index);
CREATE INDEX idx_links_order ON links(order_index);
CREATE INDEX idx_links_section ON links(section_id);
CREATE INDEX idx_link_clicks_link ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at);

-- Default profile row
INSERT INTO profile (id, name, bio) VALUES (1, 'Jungwoo Lee', 'Welcome to my links');

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- RLS policies
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public read active links" ON links FOR SELECT USING (is_active = true);

-- Storage policies for avatars
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
