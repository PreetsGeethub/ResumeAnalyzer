"""Make user age nullable

Revision ID: 4f2a9b7c1d3e
Revises: 1f15fa9216b0
Create Date: 2026-10-02 00:00:00
"""

from alembic import op


revision = "4f2a9b7c1d3e"
down_revision = "1f15fa9216b0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("users", "age", nullable=True)


def downgrade() -> None:
    op.alter_column("users", "age", nullable=False)
