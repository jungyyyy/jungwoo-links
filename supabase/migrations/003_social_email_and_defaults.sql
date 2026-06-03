ALTER TABLE profile ADD COLUMN IF NOT EXISTS social_email TEXT NOT NULL DEFAULT '';

UPDATE profile
SET
  social_tiktok = COALESCE(NULLIF(social_tiktok, ''), 'https://www.tiktok.com/@growjungwoo'),
  social_youtube = COALESCE(NULLIF(social_youtube, ''), 'https://www.youtube.com/@growjungwoo'),
  social_instagram = COALESCE(NULLIF(social_instagram, ''), 'https://www.instagram.com/growjungwoo'),
  social_linkedin = COALESCE(NULLIF(social_linkedin, ''), 'https://www.linkedin.com/in/jung-woo-lee-9131901a8/'),
  social_email = COALESCE(NULLIF(social_email, ''), 'jungwoolee6973@gmail.com')
WHERE id = 1;
