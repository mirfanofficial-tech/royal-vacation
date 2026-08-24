"""add raw_supplier_hotels hotels supplier_hotel_links

Revision ID: 7f12d5a2f255
Revises: 2b52dac1184c
Create Date: 2026-08-23 01:08:20.909905

VERVOTECH_INTEGRATION.md Stage B steps 14/16 — schema only. Steps 12/13/15
(the actual supplier export pull + Vervotech Hotel Mapping/Curated Content
calls that would populate these tables) are explicitly not built yet — no
supplier identities or credentials exist to call for real (see the doc's
§7 open questions). As with 2b52dac1184c, the autogenerate pass also picked
up a large amount of unrelated pre-existing drift between the raw-SQL-era
schema and today's ORM models; that's been stripped out here by hand, same
as before — only the 3 new tables are this migration's actual content.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7f12d5a2f255'
down_revision: Union[str, None] = '2b52dac1184c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('hotels',
    sa.Column('vervotech_id', sa.String(length=255), nullable=False),
    sa.Column('name', sa.Text(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('star_rating', sa.Integer(), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.Column('city', sa.String(length=255), nullable=True),
    sa.Column('country', sa.String(length=255), nullable=True),
    sa.Column('lat', sa.Numeric(precision=9, scale=6), nullable=True),
    sa.Column('lng', sa.Numeric(precision=9, scale=6), nullable=True),
    sa.Column('amenities', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb"), nullable=False),
    sa.Column('hero_image', sa.Text(), nullable=True),
    sa.Column('gallery_images', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb"), nullable=False),
    sa.Column('content_synced_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('vervotech_id')
    )
    op.create_table('raw_supplier_hotels',
    sa.Column('supplier', sa.String(length=100), nullable=False),
    sa.Column('supplier_hotel_id', sa.String(length=255), nullable=False),
    sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('supplier', 'supplier_hotel_id', name='uq_raw_supplier_hotels_supplier_hotel')
    )
    op.create_index('idx_raw_supplier_hotels_supplier', 'raw_supplier_hotels', ['supplier'], unique=False)
    op.create_table('supplier_hotel_links',
    sa.Column('hotel_id', sa.Uuid(), nullable=False),
    sa.Column('supplier', sa.String(length=100), nullable=False),
    sa.Column('supplier_hotel_id', sa.String(length=255), nullable=False),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['hotel_id'], ['hotels.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('supplier', 'supplier_hotel_id', name='uq_supplier_hotel_links_supplier_hotel')
    )
    op.create_index('idx_supplier_hotel_links_hotel_id', 'supplier_hotel_links', ['hotel_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_supplier_hotel_links_hotel_id', table_name='supplier_hotel_links')
    op.drop_table('supplier_hotel_links')
    op.drop_index('idx_raw_supplier_hotels_supplier', table_name='raw_supplier_hotels')
    op.drop_table('raw_supplier_hotels')
    op.drop_table('hotels')
