"""admin theme colors

Revision ID: b29981bcc6cf
Revises: 976a4b02ceb6
Create Date: 2026-09-02 14:25:53.527087

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b29981bcc6cf'
down_revision: Union[str, None] = '976a4b02ceb6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_HEX = "^#[0-9A-Fa-f]{6}$"
_COLOR_COLUMNS = (
    "admin_sidebar_color",
    "admin_sidebar_text_color",
    "admin_primary_color",
    "admin_accent_color",
)


def upgrade() -> None:
    op.add_column('site_theme', sa.Column('admin_sidebar_color', sa.String(length=7), nullable=True))
    op.add_column('site_theme', sa.Column('admin_sidebar_text_color', sa.String(length=7), nullable=True))
    op.add_column('site_theme', sa.Column('admin_primary_color', sa.String(length=7), nullable=True))
    op.add_column('site_theme', sa.Column('admin_accent_color', sa.String(length=7), nullable=True))
    op.add_column('site_theme', sa.Column('admin_corner_style', sa.String(length=10), nullable=True))

    for col in _COLOR_COLUMNS:
        op.create_check_constraint(
            f"site_theme_{col}_check",
            "site_theme",
            f"{col} IS NULL OR {col} ~ '{_HEX}'",
        )
    op.create_check_constraint(
        "site_theme_admin_corner_style_check",
        "site_theme",
        "admin_corner_style IS NULL OR admin_corner_style IN ('sharp', 'soft', 'round')",
    )


def downgrade() -> None:
    op.drop_constraint("site_theme_admin_corner_style_check", "site_theme", type_="check")
    for col in _COLOR_COLUMNS:
        op.drop_constraint(f"site_theme_{col}_check", "site_theme", type_="check")

    op.drop_column('site_theme', 'admin_corner_style')
    op.drop_column('site_theme', 'admin_accent_color')
    op.drop_column('site_theme', 'admin_primary_color')
    op.drop_column('site_theme', 'admin_sidebar_text_color')
    op.drop_column('site_theme', 'admin_sidebar_color')
