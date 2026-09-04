"""rework promo codes to percentage + min-spend + cap

Revision ID: d1a2b3c4d5e6
Revises: c4b9a2f1d0e5
Create Date: 2026-09-04 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1a2b3c4d5e6'
down_revision: Union[str, None] = 'c4b9a2f1d0e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('promo_codes_discount_check', 'promo_codes', type_='check')
    op.drop_column('promo_codes', 'discount_amount')

    op.add_column('promo_codes', sa.Column('discount_percent', sa.Numeric(precision=5, scale=2), nullable=True))
    op.add_column('promo_codes', sa.Column('max_discount_amount', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('promo_codes', sa.Column('max_discount_currency', sa.String(length=3), nullable=True))
    op.add_column('promo_codes', sa.Column('min_spend_amount', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('promo_codes', sa.Column('min_spend_currency', sa.String(length=3), nullable=True))

    _transform_existing_rows()

    op.alter_column('promo_codes', 'discount_percent', existing_type=sa.Numeric(precision=5, scale=2), nullable=False, server_default=sa.text('0'))
    op.create_check_constraint('promo_codes_percent_check', 'promo_codes', 'discount_percent >= 0 AND discount_percent <= 100')


def _transform_existing_rows() -> None:
    table = sa.table(
        "promo_codes",
        sa.column("code", sa.String()),
        sa.column("description", sa.Text()),
        sa.column("discount_percent", sa.Numeric()),
        sa.column("max_discount_amount", sa.Numeric()),
        sa.column("max_discount_currency", sa.String()),
        sa.column("min_spend_amount", sa.Numeric()),
        sa.column("min_spend_currency", sa.String()),
    )
    bind = op.get_bind()
    bind.execute(
        table.update()
        .where(table.c.code == "ROYAL10")
        .values(
            discount_percent=10,
            description="Royal Vacation launch promo — 10% off your stay (up to 10,000 AED).",
            max_discount_amount=10000,
            max_discount_currency="AED",
            min_spend_amount=100,
            min_spend_currency="AED",
        )
    )
    bind.execute(
        table.update()
        .where(table.c.code == "WELCOME5")
        .values(
            discount_percent=5,
            description="First-time guest welcome discount — 5% off your stay.",
            min_spend_amount=50,
            min_spend_currency="AED",
        )
    )
    bind.execute(
        table.update()
        .where(table.c.discount_percent.is_(None))
        .values(discount_percent=0)
    )


def downgrade() -> None:
    op.drop_constraint('promo_codes_percent_check', 'promo_codes', type_='check')
    op.add_column('promo_codes', sa.Column('discount_amount', sa.Numeric(precision=12, scale=2), server_default=sa.text('0'), nullable=False))
    op.create_check_constraint('promo_codes_discount_check', 'promo_codes', 'discount_amount >= 0')

    op.drop_column('promo_codes', 'min_spend_currency')
    op.drop_column('promo_codes', 'min_spend_amount')
    op.drop_column('promo_codes', 'max_discount_currency')
    op.drop_column('promo_codes', 'max_discount_amount')
    op.alter_column('promo_codes', 'discount_percent', existing_type=sa.Numeric(precision=5, scale=2), nullable=True, server_default=None)
    op.drop_column('promo_codes', 'discount_percent')
