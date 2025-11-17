import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  bookingId: string;
  userEmail: string;
  userName: string;
  restaurantName: string;
  bookingDate: string;
  bookingTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { bookingId, userEmail, userName, restaurantName, bookingDate, bookingTime }: CancellationRequest = await req.json();

    // Get booking details to check cancellation timing
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('booking_date, booking_time, user_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Calculate hours until booking
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Reduce points if cancellation is within 48 hours
    let pointsDeducted = 0;
    if (hoursUntilBooking < 48) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', booking.user_id)
        .single();

      if (profile && profile.points > 0) {
        const deduction = Math.min(50, profile.points); // Deduct 50 points or remaining points
        pointsDeducted = deduction;
        
        const newPoints = Math.max(0, profile.points - deduction);
        await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', booking.user_id);
      }
    }

    // Send cancellation email
    const emailResponse = await resend.emails.send({
      from: "OneTable <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Prenotazione Annullata - OneTable",
      html: `
        <h1>Prenotazione Annullata</h1>
        <p>Ciao ${userName},</p>
        <p>La tua prenotazione è stata annullata:</p>
        <ul>
          <li><strong>Ristorante:</strong> ${restaurantName}</li>
          <li><strong>Data:</strong> ${new Date(bookingDate).toLocaleDateString('it-IT')}</li>
          <li><strong>Ora:</strong> ${bookingTime}</li>
        </ul>
        ${pointsDeducted > 0 ? `<p style="color: orange;"><strong>Attenzione:</strong> Poiché la cancellazione è avvenuta a meno di 48 ore dalla prenotazione, ti sono stati detratti ${pointsDeducted} punti.</p>` : ''}
        <p>Speriamo di rivederti presto!</p>
        <p>Il team di OneTable</p>
      `,
    });

    console.log("Cancellation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pointsDeducted,
        emailSent: true 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-cancellation-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
