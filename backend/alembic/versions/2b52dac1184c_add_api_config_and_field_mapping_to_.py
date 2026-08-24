"""add api_config and field_mapping to third_party_modules

Revision ID: 2b52dac1184c
Revises: 8fd69e86b751
Create Date: 2026-08-23 00:28:47.923680

VERVOTECH_INTEGRATION.md Stage A steps 2/3/5. The autogenerate pass also
picked up a large amount of pre-existing drift (TEXT vs VARCHAR(N), several
indexes/constraints) between the raw-SQL-era schema and today's ORM models —
none of that is part of this change, so it's been stripped out here by hand;
only the two new `third_party_modules` columns and the seed rows below are
this migration's actual content.
"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2b52dac1184c'
down_revision: Union[str, None] = '8fd69e86b751'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


VERVOTECH_CREDENTIAL_SCHEMA = [
    {"key": "accountId", "label": "Account ID", "secret": False, "required": True},
    {"key": "apiKey", "label": "API Key", "secret": True, "required": True},
]

GENERIC_SUPPLIER_CREDENTIAL_SCHEMA = [
    {"key": "apiKey", "label": "API Key", "secret": True, "required": True},
    {"key": "baseUrl", "label": "Base URL", "secret": False, "required": True},
]

# Real name/auth for Vervotech; the 3 suppliers are placeholders — see
# VERVOTECH_INTEGRATION.md §7 open questions ("which 3 suppliers,
# specifically?"). Renamed/reconfigured from the admin UI once known, which
# is exactly what the admin-driven onboarding this stage builds is for.
SEED_ROWS = [
    {
        "provider": "vervotech",
        "module_id": "vervotech",
        "name": "Vervotech",
        "credential_schema": VERVOTECH_CREDENTIAL_SCHEMA,
        "help_text": (
            "Hotel content & mapping API — resolves the same hotel across "
            "suppliers and provides curated content (name, images, "
            "amenities). Does not sell rooms; booking still goes through "
            "each supplier directly. See VERVOTECH_INTEGRATION.md."
        ),
    },
    {
        "provider": "supplier-a",
        "module_id": "supplier-a",
        "name": "Supplier A",
        "credential_schema": GENERIC_SUPPLIER_CREDENTIAL_SCHEMA,
        "help_text": (
            "Placeholder row — rename once this supplier's real identity "
            "and API docs are known (VERVOTECH_INTEGRATION.md §7)."
        ),
    },
    {
        "provider": "supplier-b",
        "module_id": "supplier-b",
        "name": "Supplier B",
        "credential_schema": GENERIC_SUPPLIER_CREDENTIAL_SCHEMA,
        "help_text": (
            "Placeholder row — rename once this supplier's real identity "
            "and API docs are known (VERVOTECH_INTEGRATION.md §7)."
        ),
    },
    {
        "provider": "supplier-c",
        "module_id": "supplier-c",
        "name": "Supplier C",
        "credential_schema": GENERIC_SUPPLIER_CREDENTIAL_SCHEMA,
        "help_text": (
            "Placeholder row — rename once this supplier's real identity "
            "and API docs are known (VERVOTECH_INTEGRATION.md §7)."
        ),
    },
]


def upgrade() -> None:
    op.add_column(
        "third_party_modules",
        sa.Column("api_config", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "third_party_modules",
        sa.Column("field_mapping", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )

    connection = op.get_bind()
    for row in SEED_ROWS:
        connection.execute(
            sa.text(
                "INSERT INTO third_party_modules "
                "(provider, module_id, name, category, status, credential_schema, help_text) "
                "VALUES (:provider, :module_id, :name, 'Hotels Module', 'inactive', "
                "CAST(:credential_schema AS jsonb), :help_text) "
                "ON CONFLICT (provider) DO NOTHING"
            ),
            {
                "provider": row["provider"],
                "module_id": row["module_id"],
                "name": row["name"],
                "credential_schema": json.dumps(row["credential_schema"]),
                "help_text": row["help_text"],
            },
        )


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(
        sa.text(
            "DELETE FROM third_party_modules WHERE provider IN "
            "('vervotech', 'supplier-a', 'supplier-b', 'supplier-c')"
        )
    )
    op.drop_column("third_party_modules", "field_mapping")
    op.drop_column("third_party_modules", "api_config")
