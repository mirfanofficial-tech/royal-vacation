"""promo codes

Revision ID: c4b9a2f1d0e5
Revises: 7e74f0ff342f
Create Date: 2026-09-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4b9a2f1d0e5'
down_revision: Union[str, None] = '7e74f0ff342f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('promo_codes',
    sa.Column('code', sa.String(length=40), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('discount_amount', sa.Numeric(precision=12, scale=2), server_default=sa.text('0'), nullable=False),
    sa.Column('max_uses', sa.Integer(), nullable=True),
    sa.Column('used_count', sa.Integer(), server_default=sa.text('0'), nullable=False),
    sa.Column('starts_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint('discount_amount >= 0', name='promo_codes_discount_check'),
    sa.CheckConstraint('used_count >= 0', name='promo_codes_used_count_check'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('code')
    )
    op.create_index(op.f('ix_promo_codes_code'), 'promo_codes', ['code'], unique=False)

    _seed_demo_promo_codes()


_DEMO_PROMOS = [
    {
        "code": "ROYAL10",
        "description": "Royal Vacation launch promo — 10,000 AED off your stay.",
        "discount_amount": "10000",
    },
    {
        "code": "WELCOME5",
        "description": "First-time guest welcome discount.",
        "discount_amount": "5000",
    },
]


def _seed_demo_promo_codes() -> None:
    table = sa.table(
        "promo_codes",
        sa.column("code", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("discount_amount", sa.Numeric()),
    )
    bind = op.get_bind()
    for promo in _DEMO_PROMOS:
        bind.execute(
            table.insert().values(
                code=promo["code"],
                description=promo["description"],
                discount_amount=promo["discount_amount"],
            )
        )


def downgrade() -> None:
    op.drop_index(op.f('ix_promo_codes_code'), table_name='promo_codes')
    op.drop_table('promo_codes')
