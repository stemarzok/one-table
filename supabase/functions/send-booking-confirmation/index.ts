import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  userEmail: string;
  userName: string;
  restaurantName: string;
  bookingDate: string;
  bookingTime: string;
  guestsCount: number;
  specialRequests?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userEmail,
      userName,
      restaurantName,
      bookingDate,
      bookingTime,
      guestsCount,
      specialRequests,
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation to:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "OneTable <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Conferma Prenotazione - ${restaurantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Prenotazione Confermata!</h1>
          <p>Ciao ${userName},</p>
          <p>La tua prenotazione presso <strong>${restaurantName}</strong> è stata confermata.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Dettagli Prenotazione</h2>
            <p><strong>Data:</strong> ${new Date(bookingDate).toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Ora:</strong> ${bookingTime}</p>
            <p><strong>Numero di ospiti:</strong> ${guestsCount}</p>
            ${specialRequests ? `<p><strong>Richieste speciali:</strong> ${specialRequests}</p>` : ''}
          </div>
          
          <p>Ti aspettiamo! Se hai bisogno di modificare o cancellare la prenotazione, contatta direttamente il ristorante.</p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            Questa è una email automatica generata da OneTable. Per qualsiasi domanda, contatta il ristorante direttamente.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
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
