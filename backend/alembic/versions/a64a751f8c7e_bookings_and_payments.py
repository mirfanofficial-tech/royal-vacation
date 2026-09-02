"""bookings and payments

Revision ID: a64a751f8c7e
Revises: b29981bcc6cf
Create Date: 2026-09-02 15:23:13.382170

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert as pg_insert


# Seeded from client/src/lib/property-detail-mock-data.ts (the 4 fully-specified
# properties). id = "{property_id}:{rate_plan_id}". Temporary price authority
# until the live rates layer lands. Idempotent — safe to re-run.
_IMG = "https://picsum.photos/seed/{}/300/220"
_BOOKABLE_RATES = [
    # Burj Al Arab Jumeirah
    dict(property_id="burj-al-arab", property_name="Burj Al Arab Jumeirah",
         room_id="standard-double-room", room_name="Standard Double Room",
         room_image=_IMG.format("burj-room-1"), currency="PKR",
         rate_plan_id="standard-double-breakfast-refundable", price=19958, taxes_fees=3393,
         refundable=True, max_adults=2,
         cancellation="Free cancellation before 6:00 PM on August 11, 2026",
         pay_note="No prepayment needed – pay at the property"),
    dict(property_id="burj-al-arab", property_name="Burj Al Arab Jumeirah",
         room_id="standard-double-room", room_name="Standard Double Room",
         room_image=_IMG.format("burj-room-1"), currency="PKR",
         rate_plan_id="standard-double-nonrefundable", price=19958, taxes_fees=3393,
         refundable=False, max_adults=2, cancellation="Non-refundable",
         pay_note="Pay at the property before arrival"),
    dict(property_id="burj-al-arab", property_name="Burj Al Arab Jumeirah",
         room_id="standard-double-room", room_name="Standard Double Room",
         room_image=_IMG.format("burj-room-1"), currency="PKR",
         rate_plan_id="standard-double-breakfast-3-adults", price=21732, taxes_fees=3895,
         refundable=True, max_adults=3,
         cancellation="Free cancellation before 6:00 PM on August 11, 2026",
         pay_note="No prepayment needed – pay at the property"),
    dict(property_id="burj-al-arab", property_name="Burj Al Arab Jumeirah",
         room_id="superior-studio", room_name="Superior Studio",
         room_image=_IMG.format("burj-room-2"), currency="PKR",
         rate_plan_id="superior-studio-nonrefundable", price=32789, taxes_fees=5574,
         refundable=False, max_adults=2, cancellation="Non-refundable",
         pay_note="Pay at the property before arrival"),
    # Atlantis, The Palm
    dict(property_id="atlantis-the-palm", property_name="Atlantis, The Palm",
         room_id="ocean-deluxe", room_name="Ocean Deluxe Room",
         room_image=_IMG.format("atlantis-room-1"), currency="PKR",
         rate_plan_id="ocean-deluxe-breakfast", price=52700, taxes_fees=8950,
         refundable=True, max_adults=2,
         cancellation="Free cancellation before 6:00 PM on August 10, 2026",
         pay_note="No prepayment needed – pay at the property"),
    dict(property_id="atlantis-the-palm", property_name="Atlantis, The Palm",
         room_id="ocean-deluxe", room_name="Ocean Deluxe Room",
         room_image=_IMG.format("atlantis-room-1"), currency="PKR",
         rate_plan_id="ocean-deluxe-nonrefundable", price=49900, taxes_fees=8480,
         refundable=False, max_adults=3, cancellation="Non-refundable",
         pay_note="Pay at the property before arrival"),
    dict(property_id="atlantis-the-palm", property_name="Atlantis, The Palm",
         room_id="imperial-club", room_name="Imperial Club Room",
         room_image=_IMG.format("atlantis-room-2"), currency="PKR",
         rate_plan_id="imperial-club-nonrefundable", price=64500, taxes_fees=10965,
         refundable=False, max_adults=2, cancellation="Non-refundable",
         pay_note="Pay at the property before arrival"),
    # Address Downtown
    dict(property_id="address-downtown", property_name="Address Downtown",
         room_id="fountain-view-room", room_name="Fountain View Room",
         room_image=_IMG.format("address-room-1"), currency="PKR",
         rate_plan_id="fountain-view-breakfast", price=48500, taxes_fees=8245,
         refundable=True, max_adults=2,
         cancellation="Free cancellation before 6:00 PM on August 9, 2026",
         pay_note="No prepayment needed – pay at the property"),
    dict(property_id="address-downtown", property_name="Address Downtown",
         room_id="burj-view-suite", room_name="Burj Khalifa View Suite",
         room_image=_IMG.format("address-room-2"), currency="PKR",
         rate_plan_id="burj-view-nonrefundable", price=61000, taxes_fees=10370,
         refundable=False, max_adults=2, cancellation="Non-refundable",
         pay_note="Pay at the property before arrival"),
    # Rove Downtown
    dict(property_id="rove-downtown", property_name="Rove Downtown",
         room_id="rover-room", room_name="Rover Room",
         room_image=_IMG.format("rove-room-1"), currency="PKR",
         rate_plan_id="rover-room-nonrefundable", price=26010, taxes_fees=4422,
         refundable=False, max_adults=2, cancellation="Non-refundable",
         pay_note="Pay at the property before arrival"),
    dict(property_id="rove-downtown", property_name="Rove Downtown",
         room_id="family-room", room_name="Family Room",
         room_image=_IMG.format("rove-room-3"), currency="PKR",
         rate_plan_id="family-room-breakfast", price=38200, taxes_fees=6494,
         refundable=True, max_adults=4,
         cancellation="Free cancellation before 6:00 PM on August 12, 2026",
         pay_note="No prepayment needed – pay at the property"),
]


# revision identifiers, used by Alembic.
revision: str = 'a64a751f8c7e'
down_revision: Union[str, None] = 'b29981bcc6cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('bookable_rates',
    sa.Column('id', sa.String(length=64), nullable=False),
    sa.Column('property_id', sa.String(length=64), nullable=False),
    sa.Column('property_name', sa.String(length=255), nullable=False),
    sa.Column('room_id', sa.String(length=64), nullable=False),
    sa.Column('room_name', sa.String(length=255), nullable=False),
    sa.Column('room_image', sa.Text(), nullable=True),
    sa.Column('currency', sa.String(length=3), nullable=False),
    sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('taxes_fees', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('refundable', sa.Boolean(), server_default='true', nullable=False),
    sa.Column('pay_note', sa.String(length=255), nullable=True),
    sa.Column('cancellation', sa.String(length=255), nullable=True),
    sa.Column('max_adults', sa.Integer(), server_default='2', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('bookings',
    sa.Column('reference', sa.String(length=32), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=True),
    sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
    sa.Column('payment_timing', sa.String(length=20), nullable=False),
    sa.Column('rate_plan_id', sa.String(length=64), nullable=False),
    sa.Column('property_id', sa.String(length=64), nullable=False),
    sa.Column('property_name', sa.String(length=255), nullable=False),
    sa.Column('room_id', sa.String(length=64), nullable=False),
    sa.Column('room_name', sa.String(length=255), nullable=False),
    sa.Column('room_image', sa.Text(), nullable=True),
    sa.Column('location', sa.String(length=255), nullable=True),
    sa.Column('currency', sa.String(length=3), nullable=False),
    sa.Column('check_in', sa.Date(), nullable=False),
    sa.Column('check_out', sa.Date(), nullable=False),
    sa.Column('nights', sa.Integer(), nullable=False),
    sa.Column('adults', sa.Integer(), server_default='2', nullable=False),
    sa.Column('rooms', sa.Integer(), server_default='1', nullable=False),
    sa.Column('guest_first_name', sa.String(length=120), nullable=False),
    sa.Column('guest_last_name', sa.String(length=120), nullable=True),
    sa.Column('guest_email', sa.String(length=255), nullable=False),
    sa.Column('guest_dial_code', sa.String(length=8), nullable=True),
    sa.Column('guest_phone', sa.String(length=40), nullable=True),
    sa.Column('guest_country', sa.String(length=2), nullable=True),
    sa.Column('nights_subtotal', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('extras_total', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('taxes_fees', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('service_fee', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('promo_code', sa.String(length=40), nullable=True),
    sa.Column('promo_discount', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('total_amount', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint("payment_timing IN ('pay_now', 'pay_later')", name='bookings_payment_timing_check'),
    sa.CheckConstraint("status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')", name='bookings_status_check'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('reference')
    )
    op.create_table('booking_extras',
    sa.Column('booking_id', sa.Uuid(), nullable=False),
    sa.Column('extra_id', sa.String(length=64), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('payments',
    sa.Column('booking_id', sa.Uuid(), nullable=False),
    sa.Column('gateway', sa.String(length=40), server_default=sa.text("'stripe'"), nullable=False),
    sa.Column('stripe_payment_intent_id', sa.String(length=255), nullable=False),
    sa.Column('stripe_customer_id', sa.String(length=255), nullable=True),
    sa.Column('status', sa.String(length=30), server_default=sa.text("'requires_payment_method'"), nullable=False),
    sa.Column('capture_method', sa.String(length=20), server_default=sa.text("'automatic'"), nullable=False),
    sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('amount_captured', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('amount_refunded', sa.Numeric(precision=12, scale=2), server_default='0', nullable=False),
    sa.Column('currency', sa.String(length=3), nullable=False),
    sa.Column('card_brand', sa.String(length=40), nullable=True),
    sa.Column('card_last4', sa.String(length=4), nullable=True),
    sa.Column('error_message', sa.Text(), nullable=True),
    sa.Column('authorized_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('captured_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint("capture_method IN ('automatic', 'manual')", name='payments_capture_method_check'),
    sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('booking_id'),
    sa.UniqueConstraint('stripe_payment_intent_id')
    )
    op.create_table('payment_refunds',
    sa.Column('payment_id', sa.Uuid(), nullable=False),
    sa.Column('booking_id', sa.Uuid(), nullable=False),
    sa.Column('stripe_refund_id', sa.String(length=255), nullable=False),
    sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('currency', sa.String(length=3), nullable=False),
    sa.Column('reason', sa.String(length=255), nullable=True),
    sa.Column('status', sa.String(length=30), server_default=sa.text("'pending'"), nullable=False),
    sa.Column('id', sa.Uuid(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('stripe_refund_id')
    )
    # ### end Alembic commands ###

    bookable_rates = sa.table(
        "bookable_rates",
        sa.column("id", sa.String),
        sa.column("property_id", sa.String),
        sa.column("property_name", sa.String),
        sa.column("room_id", sa.String),
        sa.column("room_name", sa.String),
        sa.column("room_image", sa.Text),
        sa.column("currency", sa.String),
        sa.column("price", sa.Numeric),
        sa.column("taxes_fees", sa.Numeric),
        sa.column("refundable", sa.Boolean),
        sa.column("pay_note", sa.String),
        sa.column("cancellation", sa.String),
        sa.column("max_adults", sa.Integer),
    )
    rows = [
        {
            "id": f"{r['property_id']}:{r['rate_plan_id']}",
            "property_id": r["property_id"],
            "property_name": r["property_name"],
            "room_id": r["room_id"],
            "room_name": r["room_name"],
            "room_image": r["room_image"],
            "currency": r["currency"],
            "price": r["price"],
            "taxes_fees": r["taxes_fees"],
            "refundable": r["refundable"],
            "pay_note": r["pay_note"],
            "cancellation": r["cancellation"],
            "max_adults": r["max_adults"],
        }
        for r in _BOOKABLE_RATES
    ]
    op.execute(
        pg_insert(bookable_rates).values(rows).on_conflict_do_nothing(index_elements=["id"])
    )


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('payment_refunds')
    op.drop_table('payments')
    op.drop_table('booking_extras')
    op.drop_table('bookings')
    op.drop_table('bookable_rates')
    # ### end Alembic commands ###
