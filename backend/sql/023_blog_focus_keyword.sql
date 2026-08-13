-- Royal Vacation — Blog: add `focus_keyword` to `blog_posts`, powering a
-- real (computed, not decorative) SEO score in the admin editor.
-- PostgreSQL 16+  |  depends on `019_blog.sql`

ALTER TABLE blog_posts ADD COLUMN focus_keyword TEXT;
