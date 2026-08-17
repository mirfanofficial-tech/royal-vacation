"""Admin CMS Translation Tasks — `/api/v1/admin/cms/translations/*`.

Lightweight flag-as-needed tracker (Phase 3 of the CMS roadmap): a task just
records "translate {entity} into {target_language_code}" with a status. No
assignee/inbox/reviewer — the scope decision was explicitly the lightweight
option, and `cms_translation_memory` was dropped entirely.

Entity resolution is polymorphic (`entity_type` + `entity_id`, no FK) exactly
like `cms_content_revisions`: `cms_page` joins `cms_pages`, `blog_post` joins
`blog_posts`. `entity_title` is resolved at read time via two LEFT JOINs so the
tasks list screen can show the page/post title without storing a denormalized
copy. `requested_by` captures the acting admin's identity
(`display_name or email`) like revisions, not a static default.

Duplicate active requests (same entity + target language while a task is still
`requested`) are prevented by the partial unique index
`uq_cms_translation_tasks_active` — a fresh create returns 409. Marking an old
task `done`/`cancelled` frees the slot for a re-request.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.blog import BlogPost
from app.models.cms import CmsPage, CmsTranslationTask
from app.models.reference import Language
from app.models.user import User
from app.schemas.cms_translation import (
    TranslationTaskCreate,
    TranslationTaskOut,
    TranslationTaskUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


def _to_out(task: CmsTranslationTask, entity_title: str | None) -> TranslationTaskOut:
    return TranslationTaskOut(
        id=task.id,
        entity_type=task.entity_type,
        entity_id=task.entity_id,
        entity_title=entity_title,
        target_language_code=task.target_language_code,
        status=task.status,
        requested_by=task.requested_by,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


async def _get_task(db: AsyncSession, task_id: str) -> CmsTranslationTask:
    try:
        uid = UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    result = await db.execute(select(CmsTranslationTask).where(CmsTranslationTask.id == uid))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


async def _resolve_entity_title(
    db: AsyncSession, entity_type: str, entity_id: UUID
) -> str | None:
    if entity_type == "cms_page":
        result = await db.execute(select(CmsPage.title).where(CmsPage.id == entity_id))
    elif entity_type == "blog_post":
        result = await db.execute(select(BlogPost.title).where(BlogPost.id == entity_id))
    else:
        return None
    return result.scalar_one_or_none()


@router.get("", response_model=list[TranslationTaskOut])
async def list_translation_tasks(
    entity_type: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> list[TranslationTaskOut]:
    Page = aliased(CmsPage)
    Post = aliased(BlogPost)
    query = (
        select(
            CmsTranslationTask,
            Page.title,
            Post.title,
        )
        .outerjoin(
            Page,
            (CmsTranslationTask.entity_type == "cms_page")
            & (CmsTranslationTask.entity_id == Page.id),
        )
        .outerjoin(
            Post,
            (CmsTranslationTask.entity_type == "blog_post")
            & (CmsTranslationTask.entity_id == Post.id),
        )
        .order_by(CmsTranslationTask.created_at.desc())
    )
    if entity_type:
        query = query.where(CmsTranslationTask.entity_type == entity_type)
    if status_filter:
        query = query.where(CmsTranslationTask.status == status_filter)
    result = await db.execute(query)
    return [_to_out(task, page_title or post_title) for task, page_title, post_title in result.all()]


@router.post("", response_model=TranslationTaskOut, status_code=status.HTTP_201_CREATED)
async def create_translation_task(
    payload: TranslationTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> TranslationTaskOut:
    if payload.target_language_code == "en":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="English is the source language — pick a target language.",
        )

    entity_title = await _resolve_entity_title(db, payload.entity_type, payload.entity_id)
    if entity_title is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{payload.entity_type} not found",
        )

    language = await db.execute(
        select(Language).where(
            Language.code == payload.target_language_code, Language.is_active.is_(True)
        )
    )
    if language.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown or inactive target language",
        )

    existing = await db.execute(
        select(CmsTranslationTask).where(
            CmsTranslationTask.entity_type == payload.entity_type,
            CmsTranslationTask.entity_id == payload.entity_id,
            CmsTranslationTask.target_language_code == payload.target_language_code,
            CmsTranslationTask.status == "requested",
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A translation request for this language is already pending.",
        )

    task = CmsTranslationTask(
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        target_language_code=payload.target_language_code,
        requested_by=current_user.display_name or current_user.email,
    )
    db.add(task)
    await db.commit()
    return _to_out(task, entity_title)


@router.patch("/{task_id}", response_model=TranslationTaskOut)
async def update_translation_task(
    task_id: str,
    payload: TranslationTaskUpdate,
    db: AsyncSession = Depends(get_db),
) -> TranslationTaskOut:
    task = await _get_task(db, task_id)
    task.status = payload.status
    await db.commit()
    # Re-select after commit: the `set_updated_at()` trigger rewrites
    # `updated_at` server-side, and the in-session ORM object can't lazy-load
    # it (MissingGreenlet in async SQLAlchemy). Same pattern as cms_pages.py.
    task = await _get_task(db, task_id)
    entity_title = await _resolve_entity_title(db, task.entity_type, task.entity_id)
    return _to_out(task, entity_title)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_translation_task(
    task_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    task = await _get_task(db, task_id)
    await db.delete(task)
    await db.commit()
