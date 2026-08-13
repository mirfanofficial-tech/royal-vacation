-- Royal Vacation — Blog: add `sort_order`/`is_visible` to `blog_categories`,
-- powering real drag-to-reorder and a real visibility toggle in the admin
-- (list ordering was previously hardcoded alphabetical, with no way to hide
-- a category from the public site).
-- PostgreSQL 16+  |  depends on `019_blog.sql`

ALTER TABLE blog_categories
    ADD COLUMN sort_order INT NOT NULL DEFAULT 0,
    ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;
