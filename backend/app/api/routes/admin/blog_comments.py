"""Admin Blog Comments moderation inbox — `/api/v1/admin/blog/comments/*`.

Global queue across all posts (not per-post-only) — filterable by `status`
and `blog_post_id`. Admin replies are created as regular `blog_comments`
rows with `is_admin_reply=true`, auto-approved (they're already visible,
authored by the person triaging the queue).
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.blog import BlogComment, BlogPost
from app.models.user import User
from app.schemas.blog import BlogCommentAdminOut, BlogCommentModerate, BlogCommentReplyCreate

router = APIRouter(dependencies=[Depends(require_admin)])


def _to_admin_out(comment: BlogComment, post_title: str, post_slug: str) -> BlogCommentAdminOut:
    return BlogCommentAdminOut(
        id=comment.id,
        parent_comment_id=comment.parent_comment_id,
        author_name=comment.author_name,
        body=comment.body,
        is_admin_reply=comment.is_admin_reply,
        status=comment.status,
        created_at=comment.created_at,
        blog_post_id=comment.blog_post_id,
        post_title=post_title,
        post_slug=post_slug,
        author_email=comment.author_email,
        updated_at=comment.updated_at,
    )


async def _get_comment(db: AsyncSession, comment_id: str) -> BlogComment:
    try:
        uid = UUID(comment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    result = await db.execute(select(BlogComment).where(BlogComment.id == uid))
    comment = result.scalar_one_or_none()
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    return comment


async def _get_comment_row(db: AsyncSession, comment_id: str) -> BlogCommentAdminOut:
    try:
        uid = UUID(comment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    result = await db.execute(
        select(BlogComment, BlogPost.title, BlogPost.slug)
        .join(BlogPost, BlogPost.id == BlogComment.blog_post_id)
        .where(BlogComment.id == uid)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    comment, post_title, post_slug = row
    return _to_admin_out(comment, post_title, post_slug)


@router.get("", response_model=list[BlogCommentAdminOut])
async def list_blog_comments(
    status_filter: str | None = Query(default=None, alias="status"),
    blog_post_id: UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[BlogCommentAdminOut]:
    query = (
        select(BlogComment, BlogPost.title, BlogPost.slug)
        .join(BlogPost, BlogPost.id == BlogComment.blog_post_id)
        .order_by(BlogComment.created_at.desc())
    )
    if status_filter:
        query = query.where(BlogComment.status == status_filter)
    if blog_post_id:
        query = query.where(BlogComment.blog_post_id == blog_post_id)
    result = await db.execute(query)
    return [_to_admin_out(comment, title, slug) for comment, title, slug in result.all()]


@router.patch("/{comment_id}", response_model=BlogCommentAdminOut)
async def moderate_blog_comment(
    comment_id: str, payload: BlogCommentModerate, db: AsyncSession = Depends(get_db)
) -> BlogCommentAdminOut:
    comment = await _get_comment(db, comment_id)
    comment.status = payload.status
    await db.commit()
    return await _get_comment_row(db, comment_id)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_comment(comment_id: str, db: AsyncSession = Depends(get_db)) -> None:
    comment = await _get_comment(db, comment_id)
    await db.delete(comment)
    await db.commit()


@router.post("/{comment_id}/reply", response_model=BlogCommentAdminOut, status_code=status.HTTP_201_CREATED)
async def reply_to_blog_comment(
    comment_id: str,
    payload: BlogCommentReplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> BlogCommentAdminOut:
    parent = await _get_comment(db, comment_id)
    reply = BlogComment(
        blog_post_id=parent.blog_post_id,
        parent_comment_id=parent.id,
        author_name=current_user.display_name or "Royal Vacation Team",
        author_email=current_user.email,
        body=payload.body,
        status="approved",
        is_admin_reply=True,
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)
    return await _get_comment_row(db, str(reply.id))
