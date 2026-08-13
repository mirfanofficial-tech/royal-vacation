"""Shared revision-history helpers for CMS pages and blog posts.

`cms_content_revisions` is one polymorphic table (`entity_type` + `entity_id`,
same shape as `user_activity_logs`) — this module keeps the list/create/prune
logic in one place so `cms_pages.py` and `blog_posts.py` don't each carry a
near-identical copy.
"""

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cms import CmsContentRevision
from app.schemas.revisions import RevisionOut, RevisionSummaryOut

MAX_REVISIONS_PER_ENTITY = 50


async def create_revision(
    db: AsyncSession,
    entity_type: str,
    entity_id: UUID,
    snapshot: dict,
    created_by: str,
) -> None:
    db.add(
        CmsContentRevision(
            entity_type=entity_type,
            entity_id=entity_id,
            snapshot=snapshot,
            created_by=created_by,
        )
    )
    await db.flush()

    stale = await db.execute(
        select(CmsContentRevision.id)
        .where(
            CmsContentRevision.entity_type == entity_type,
            CmsContentRevision.entity_id == entity_id,
        )
        .order_by(CmsContentRevision.created_at.desc())
        .offset(MAX_REVISIONS_PER_ENTITY)
    )
    stale_ids = [row[0] for row in stale.all()]
    if stale_ids:
        await db.execute(delete(CmsContentRevision).where(CmsContentRevision.id.in_(stale_ids)))


def _to_summary_out(revision: CmsContentRevision) -> RevisionSummaryOut:
    return RevisionSummaryOut(
        id=revision.id,
        entity_type=revision.entity_type,
        entity_id=revision.entity_id,
        title=revision.snapshot.get("title", ""),
        created_by=revision.created_by,
        created_at=revision.created_at,
    )


def to_revision_out(revision: CmsContentRevision) -> RevisionOut:
    summary = _to_summary_out(revision)
    return RevisionOut(**summary.model_dump(), snapshot=revision.snapshot)


async def list_revisions(
    db: AsyncSession, entity_type: str, entity_id: UUID
) -> list[RevisionSummaryOut]:
    result = await db.execute(
        select(CmsContentRevision)
        .where(
            CmsContentRevision.entity_type == entity_type,
            CmsContentRevision.entity_id == entity_id,
        )
        .order_by(CmsContentRevision.created_at.desc())
    )
    return [_to_summary_out(r) for r in result.scalars().all()]


async def get_revision(
    db: AsyncSession, entity_type: str, entity_id: UUID, revision_id: UUID
) -> CmsContentRevision | None:
    result = await db.execute(
        select(CmsContentRevision).where(
            CmsContentRevision.id == revision_id,
            CmsContentRevision.entity_type == entity_type,
            CmsContentRevision.entity_id == entity_id,
        )
    )
    return result.scalar_one_or_none()
