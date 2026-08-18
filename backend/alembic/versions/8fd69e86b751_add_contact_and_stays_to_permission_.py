"""add contact and stays to permission modules

Revision ID: 8fd69e86b751
Revises: efb6f2e2bb2d
Create Date: 2026-08-18 17:12:18.907646

Adds 'contact' (new admin Contact Messages inbox) to the permission-module
allowlist. Also adds 'stays' — a pre-existing gap: the Stays module has
shipped in the admin UI and sidebar for a while, but its CHECK constraint
was never updated, so no role could ever be granted stays permissions
through the roles UI. Fixing both together since it's the same constraint.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8fd69e86b751'
down_revision: Union[str, None] = 'efb6f2e2bb2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_MODULES = [
    ("stays", "Stays"),
    ("contact", "Contact Messages"),
]
ACTIONS = [
    ("view", "View"),
    ("create", "Create"),
    ("edit", "Update"),
    ("delete", "Delete"),
]


def upgrade() -> None:
    op.drop_constraint("permissions_resource_check", "permissions", type_="check")
    op.create_check_constraint(
        "permissions_resource_check",
        "permissions",
        "resource IN ('dashboard','properties','bookings','guests','modules',"
        "'cms','blog','contact','reports','payments','settings','roles','stays')",
    )

    op.drop_constraint("role_permissions_module_check", "role_permissions", type_="check")
    op.create_check_constraint(
        "role_permissions_module_check",
        "role_permissions",
        "module IN ('dashboard','properties','bookings','guests','modules',"
        "'cms','blog','contact','reports','payments','settings','roles','stays')",
    )

    permissions = sa.table(
        "permissions",
        sa.column("name", sa.String),
        sa.column("resource", sa.String),
        sa.column("action", sa.String),
        sa.column("description", sa.String),
    )
    connection = op.get_bind()
    for resource, label in NEW_MODULES:
        for action, action_label in ACTIONS:
            connection.execute(
                sa.text(
                    "INSERT INTO permissions (name, resource, action, description) "
                    "VALUES (:name, :resource, :action, :description) "
                    "ON CONFLICT (name) DO NOTHING"
                ),
                {
                    "name": f"{action}_{resource}",
                    "resource": resource,
                    "action": action,
                    "description": f"{action_label} {label}",
                },
            )


def downgrade() -> None:
    op.execute("DELETE FROM permissions WHERE resource IN ('stays', 'contact')")
    op.execute("DELETE FROM role_permissions WHERE module IN ('stays', 'contact')")

    op.drop_constraint("role_permissions_module_check", "role_permissions", type_="check")
    op.create_check_constraint(
        "role_permissions_module_check",
        "role_permissions",
        "module IN ('dashboard','properties','bookings','guests','modules',"
        "'cms','blog','reports','payments','settings','roles')",
    )

    op.drop_constraint("permissions_resource_check", "permissions", type_="check")
    op.create_check_constraint(
        "permissions_resource_check",
        "permissions",
        "resource IN ('dashboard','properties','bookings','guests','modules',"
        "'cms','blog','reports','payments','settings','roles')",
    )
