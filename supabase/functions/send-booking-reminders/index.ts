import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get bookings happening in 24 hours (tomorrow at the same time)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    
    console.log(`Checking for bookings on ${tomorrowDate}`);
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        restaurants:restaurant_id (
          name,
          address,
          city,
          phone,
          owner_id,
          profiles:owner_id (
            name,
            email
          )
        ),
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('booking_date', tomorrowDate)
      .in('status', ['pending', 'confirmed']);
    
    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }
    
    console.log(`Found ${bookings?.length || 0} bookings for tomorrow`);
    
    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No bookings to remind" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    const results = [];
    
    // Send reminders to customers and restaurant owners
    for (const booking of bookings) {
      try {
        // Send customer reminder
        const customerEmail = await resend.emails.send({
          from: "OneTable <onboarding@resend.dev>",
          to: [booking.user_email],
          subject: `Reminder: Your reservation at ${booking.restaurants.name} tomorrow`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Reservation Reminder</h1>
              <p>Hi ${booking.user_name},</p>
              <p>This is a friendly reminder about your reservation:</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Restaurant:</strong> ${booking.restaurants.name}</p>
                <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString('it-IT')}</p>
                <p><strong>Time:</strong> ${booking.booking_time}</p>
                <p><strong>Guests:</strong> ${booking.guests_count}</p>
                <p><strong>Address:</strong> ${booking.restaurants.address}, ${booking.restaurants.city}</p>
              </div>
              ${booking.special_requests ? `<p><strong>Your special requests:</strong> ${booking.special_requests}</p>` : ''}
              <p>We look forward to seeing you!</p>
              <p style="color: #666; font-size: 14px;">If you need to cancel or modify your reservation, please contact the restaurant directly at ${booking.restaurants.phone}</p>
            </div>
          `,
        });
        
        results.push({ type: 'customer', booking_id: booking.id, success: true });
        
        // Send restaurant owner reminder
        if (booking.restaurants.profiles?.email) {
          const ownerEmail = await resend.emails.send({
            from: "OneTable <onboarding@resend.dev>",
            to: [booking.restaurants.profiles.email],
            subject: `Reservation tomorrow at ${booking.booking_time}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Upcoming Reservation</h1>
                <p>Hi ${booking.restaurants.profiles.name},</p>
                <p>You have a reservation tomorrow:</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Customer:</strong> ${booking.user_name}</p>
                  <p><strong>Contact:</strong> ${booking.user_email}${booking.user_phone ? `, ${booking.user_phone}` : ''}</p>
                  <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString('it-IT')}</p>
                  <p><strong>Time:</strong> ${booking.booking_time}</p>
                  <p><strong>Guests:</strong> ${booking.guests_count}</p>
                  <p><strong>Status:</strong> ${booking.status}</p>
                </div>
                ${booking.special_requests ? `<p><strong>Special requests:</strong> ${booking.special_requests}</p>` : ''}
                <p>Please ensure the table is ready for your guests.</p>
              </div>
            `,
          });
          
          results.push({ type: 'owner', booking_id: booking.id, success: true });
        }
      } catch (emailError: any) {
        console.error(`Error sending reminder for booking ${booking.id}:`, emailError);
        results.push({ type: 'error', booking_id: booking.id, error: emailError.message });
      }
    }
    
    console.log("Reminder results:", results);
    
    return new Response(
      JSON.stringify({ 
        message: "Reminders sent successfully", 
        results,
        total: bookings.length 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
