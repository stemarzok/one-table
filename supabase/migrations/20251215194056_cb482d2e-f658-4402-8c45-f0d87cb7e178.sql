-- Remove the check constraint that prevents updating past bookings
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS valid_booking_time;