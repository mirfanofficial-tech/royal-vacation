-- Royal Vacation — Blog: add a real "in_review" status to `blog_posts`.
-- PostgreSQL 16+  |  depends on `019_blog.sql`
--
-- `status` has always been a plain TEXT column enforced only by this CHECK
-- constraint (no Pydantic-level enum anywhere in the backend), so adding a
-- value is purely additive — no other backend code validates against a
-- fixed allow-list.

ALTER TABLE blog_posts DROP CONSTRAINT blog_posts_status_check;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check
    CHECK (status IN ('draft','in_review','published','scheduled'));
