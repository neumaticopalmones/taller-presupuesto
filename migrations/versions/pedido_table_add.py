"""create pedido table

Revision ID: pedido_table_add
Revises: 3f6eec664c6a
Create Date: 2025-09-14
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "pedido_table_add"
down_revision = "add_estado_columns_presupuesto"
branch_labels = None
depends_on = None


def upgrade():
    # Eliminar tablas legacy si existen con esquema antiguo (id integer, etc.)
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='pedido' AND column_name='id' AND data_type='integer'
            ) THEN
                -- Tablas antiguas dependientes
                IF to_regclass('public.pedido_item') IS NOT NULL THEN
                    EXECUTE 'DROP TABLE IF EXISTS pedido_item';
                END IF;
                EXECUTE 'DROP TABLE IF EXISTS pedido CASCADE';
            END IF;
            -- Otras tablas legacy no usadas ya
            IF to_regclass('public.inventario') IS NOT NULL THEN
                EXECUTE 'DROP TABLE IF EXISTS inventario CASCADE';
            END IF;
            IF to_regclass('public.cita') IS NOT NULL THEN
                EXECUTE 'DROP TABLE IF EXISTS cita CASCADE';
            END IF;
        END$$;
        """
    )
    op.create_table(
        "pedido",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "presupuesto_id",
            sa.String(length=36),
            sa.ForeignKey("presupuesto.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("linea_ref", sa.String(length=50), nullable=True),
        sa.Column("medida", sa.String(length=50), nullable=False),
        sa.Column("marca", sa.String(length=80), nullable=True),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("proveedor", sa.String(length=40), nullable=True),
        sa.Column("unidades", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("notas", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("confirmed_at", sa.DateTime(), nullable=True),
        sa.Column("received_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_pedido_presupuesto", "pedido", ["presupuesto_id"])
    op.create_index("ix_pedido_medida", "pedido", ["medida"])
    op.create_index("ix_pedido_marca", "pedido", ["marca"])
    op.create_index("ix_pedido_proveedor", "pedido", ["proveedor"])
    op.create_index("ix_pedido_created_at", "pedido", ["created_at"])
    op.create_index("ix_pedido_confirmed_at", "pedido", ["confirmed_at"])
    op.create_index("ix_pedido_received_at", "pedido", ["received_at"])


def downgrade():
    op.drop_index("ix_pedido_received_at", table_name="pedido")
    op.drop_index("ix_pedido_confirmed_at", table_name="pedido")
    op.drop_index("ix_pedido_created_at", table_name="pedido")
    op.drop_index("ix_pedido_proveedor", table_name="pedido")
    op.drop_index("ix_pedido_marca", table_name="pedido")
    op.drop_index("ix_pedido_medida", table_name="pedido")
    op.drop_index("ix_pedido_presupuesto", table_name="pedido")
    op.drop_table("pedido")
