import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  action: 'promoted' | 'removed';
  targetEmail: string;
  targetName: string;
  actorName: string;
  role?: string;
}

const getPromotedEmailHtml = (targetName: string, actorName: string, role: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulazioni!</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Ciao <strong>${targetName}</strong>,</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Sei stato promosso a <strong style="color: #f59e0b;">${role === 'superadmin' ? 'Super Admin' : 'Amministratore'}</strong> 
      da <strong>${actorName}</strong>.
    </p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Cosa significa?</strong><br>
        Ora hai accesso al Pannello Amministratore dove potrai gestire le richieste business, 
        le recensioni segnalate e le statistiche globali della piattaforma.
      </p>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Per accedere al pannello, effettua il login e clicca su "Pannello Admin" nel menu utente.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
      Questa è un'email automatica da OneTable. Non rispondere a questo messaggio.
    </p>
  </div>
</body>
</html>
`;

const getRemovedEmailHtml = (targetName: string, actorName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Notifica Ruolo Admin</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Ciao <strong>${targetName}</strong>,</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Ti informiamo che il tuo ruolo di <strong>Amministratore</strong> è stato rimosso da <strong>${actorName}</strong>.
    </p>
    <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Cosa cambia?</strong><br>
        Non avrai più accesso al Pannello Amministratore. 
        Potrai continuare a utilizzare la piattaforma come utente normale.
      </p>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Se ritieni che ci sia stato un errore, contatta il Super Admin della piattaforma.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
      Questa è un'email automatica da OneTable. Non rispondere a questo messaggio.
    </p>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, targetEmail, targetName, actorName, role }: AdminNotificationRequest = await req.json();

    console.log(`Sending admin notification: ${action} to ${targetEmail}`);

    let subject: string;
    let html: string;

    if (action === 'promoted') {
      subject = `🎉 Sei stato promosso a ${role === 'superadmin' ? 'Super Admin' : 'Amministratore'}!`;
      html = getPromotedEmailHtml(targetName, actorName, role || 'admin');
    } else {
      subject = 'Notifica: Modifica ruolo amministratore';
      html = getRemovedEmailHtml(targetName, actorName);
    }

    const emailResponse = await resend.emails.send({
      from: "OneTable <onboarding@resend.dev>",
      to: [targetEmail],
      subject,
      html,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
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