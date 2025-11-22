import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BookingPendingSchema = z.object({
  userEmail: z.string().email().max(255),
  userName: z.string().trim().min(1).max(100),
  restaurantName: z.string().trim().min(1).max(200),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
  guestsCount: z.number().int().min(1).max(20),
  specialRequests: z.string().max(1000).optional(),
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validated = BookingPendingSchema.parse(body);
    
    const {
      userEmail,
      userName,
      restaurantName,
      bookingDate,
      bookingTime,
      guestsCount,
      specialRequests,
    } = validated;

    console.log("Sending booking pending email to:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "OneTable <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Richiesta Prenotazione Inviata - ${escapeHtml(restaurantName)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Richiesta di Prenotazione Ricevuta</h1>
          <p>Ciao ${escapeHtml(userName)},</p>
          <p>Abbiamo ricevuto la tua richiesta di prenotazione presso <strong>${escapeHtml(restaurantName)}</strong>.</p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">⏳ In Attesa di Conferma</h3>
            <p style="color: #856404; margin-bottom: 0;">La tua prenotazione è in attesa di conferma da parte del ristorante. Riceverai un'email di conferma non appena il ristorante approverà la tua richiesta.</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Dettagli Prenotazione</h2>
            <p><strong>Data:</strong> ${new Date(bookingDate).toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Ora:</strong> ${escapeHtml(bookingTime)}</p>
            <p><strong>Numero di ospiti:</strong> ${guestsCount}</p>
            ${specialRequests ? `<p><strong>Richieste speciali:</strong> ${escapeHtml(specialRequests)}</p>` : ''}
          </div>
          
          <p>Ti invieremo un'email di conferma non appena il ristorante accetterà la tua prenotazione.</p>
          
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
            Questa è una email automatica generata da OneTable. Per qualsiasi domanda, contatta il ristorante direttamente.
          </p>
        </div>
      `,
    });

    console.log("Pending email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking pending email:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
