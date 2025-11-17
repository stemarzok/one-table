import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CreateAdminSchema = z.object({
  bootstrapPassword: z.string().min(1),
  userEmail: z.string().email().max(255),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const body = await req.json();
    const { bootstrapPassword, userEmail } = CreateAdminSchema.parse(body);

    // Verify bootstrap password
    const BOOTSTRAP_PASSWORD = Deno.env.get("ADMIN_BOOTSTRAP_PASSWORD");
    if (!BOOTSTRAP_PASSWORD || bootstrapPassword !== BOOTSTRAP_PASSWORD) {
      console.log("Invalid bootstrap password attempt");
      return new Response(
        JSON.stringify({ error: "Invalid bootstrap password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "User not found. Ensure the user is registered." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from("admin_roles")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: "User is already an administrator" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin role
    const { error: insertError } = await supabase
      .from("admin_roles")
      .insert({
        user_id: profile.id,
        created_by: profile.id,
      });

    if (insertError) {
      console.error("Error creating admin:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create admin role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin created successfully for user: ${userEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Admin created successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in create-admin function:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
