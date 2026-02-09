import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const languageNames: Record<string, string> = {
  it: "Italian",
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  nl: "Dutch",
  ru: "Russian",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLanguage, sourceLanguage = "it" } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: "texts array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({ error: "targetLanguage is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sourceLanguage === targetLanguage) {
      const result: Record<string, string> = {};
      texts.forEach((t: { key: string; value: string }) => {
        result[t.key] = t.value;
      });
      return new Response(
        JSON.stringify({ translations: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Build a structured input for better parsing
    const inputObj: Record<string, string> = {};
    texts.forEach((t: { key: string; value: string }) => {
      inputObj[t.key] = t.value;
    });

    const systemPrompt = `You are a professional translator. You will receive a JSON object with UI text strings in ${sourceLangName}. Translate ALL values to ${targetLangName}. Keep the keys exactly the same. Keep brand names like "OneTable" unchanged. Keep placeholders like {name} unchanged. Respond with ONLY the JSON object, no markdown fences, no explanation, no extra text.`;

    const userPrompt = JSON.stringify(inputObj);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let translations: Record<string, string> = {};
    try {
      // Remove potential markdown code blocks and trim
      let cleanContent = content.trim();
      // Remove ```json ... ``` wrapping
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      translations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 200));
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          translations = JSON.parse(jsonMatch[0]);
        } catch {
          // Final fallback: return original texts
          texts.forEach((t: { key: string; value: string }) => {
            translations[t.key] = t.value;
          });
        }
      } else {
        texts.forEach((t: { key: string; value: string }) => {
          translations[t.key] = t.value;
        });
      }
    }

    return new Response(
      JSON.stringify({ translations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
