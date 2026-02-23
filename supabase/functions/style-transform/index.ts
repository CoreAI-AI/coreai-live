import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Style prompts mapping - includes festival and trending styles
const stylePrompts: Record<string, string> = {
  // Original styles
  "New Year Eve": "Transform this image into a festive New Year's Eve celebration style with fireworks, sparkles, champagne gold colors, and party atmosphere",
  "Gingerbread": "Transform this image into a gingerbread cookie style with warm brown tones, icing decorations, and cozy holiday baking aesthetic",
  "Parisian Postcard": "Transform this image into a vintage Parisian postcard style with romantic Eiffel Tower vibes, soft pastel colors, and French artistic flair",
  "Santa's Helper": "Transform this image into a Christmas Santa's helper style with red and green colors, elf costume elements, and North Pole workshop atmosphere",
  "Iridescent Metal Portrait": "Transform this image into an iridescent metallic portrait with holographic colors, chrome reflections, and futuristic metal textures",
  "Bollywood Poster": "Transform this image into a classic Bollywood movie poster style with dramatic lighting, vibrant colors, and theatrical composition",
  "Candy Land": "Transform this image into a magical Candy Land style with bright candy colors, sweet treats, lollipops, and sugary fantasy landscape",
  "Festival": "Transform this image into a vibrant festival style with colorful decorations, celebration mood, and festive cultural elements",
  "Mithila": "Transform this image into traditional Mithila/Madhubani art style with intricate patterns, bold outlines, and folk art aesthetics",
  "Jaipur Textile": "Transform this image into Jaipur textile pattern style with block prints, traditional Indian motifs, and rich fabric textures",
  "Sari Landscape": "Transform this image into an artistic sari-inspired landscape with flowing silk textures, embroidery patterns, and elegant Indian textile aesthetics",
  "Desi Outfit": "Transform this person in this image wearing traditional Indian desi outfit with kurta, sherwani, or ethnic wear styling",
  "Sketch": "Transform this image into a hand-drawn pencil sketch style with realistic shading, fine lines, and artistic sketching technique",
  "Holiday Portrait": "Transform this image into a warm holiday portrait with cozy winter lighting, festive decorations, and Christmas card aesthetic",
  "Dramatic": "Transform this image into a dramatic cinematic style with high contrast, moody lighting, and theatrical atmosphere",
  "Plushie": "Transform this image into a cute plushie/stuffed toy version with soft fabric texture, button eyes, and adorable toy aesthetic",
  "Retro Anime": "Transform this image into classic 80s/90s retro anime style with vintage animation look, nostalgic color palette, and old school anime aesthetics",
  "Baseball Bobblehead": "Transform this image into a baseball bobblehead figure with oversized head, small body, baseball uniform, and collectible toy style",
  "Cricket Style": "Transform this image into a cricket player style with cricket gear, stadium atmosphere, and sports action pose",
  "Football Style": "Transform this image into a football/soccer player style with jersey, stadium background, and dynamic sports aesthetic",
  "Celebrity Style": "Merge these two people into one glamorous celebrity-style portrait with red carpet aesthetic and professional photography look",
  "Doodle": "Transform this image into a playful hand-drawn doodle style with sketchy lines, fun illustrations, and casual drawing aesthetic",
  "Sugar Cookie": "Transform this image into a decorated sugar cookie style with royal icing, pastel colors, and sweet bakery aesthetic",
  "3D Glam Doll": "Transform this image into a 3D glamorous doll style with perfect features, glossy finish, and high-fashion doll aesthetic",
  "Inkwork": "Transform this image into detailed ink artwork style with fine line work, cross-hatching, and pen illustration aesthetic",
  "Art School": "Transform this image into an art school project style with creative mixed media, artistic experimentation, and student art aesthetic",
  "Fisheye": "Transform this image with a fisheye lens effect creating a wide-angle distorted spherical view",
  "Ornament": "Transform this image into a Christmas ornament style with spherical shape, hanging decoration aesthetic, and holiday charm",
  
  // Festival-specific styles (auto-detected)
  "Diwali Festive": "Transform with warm golden Diwali glow, traditional diyas, festive lights, rangoli patterns, and rich Indian cinematic colors with bokeh light effects",
  "Holi Colors": "Transform with vibrant Holi colors, colorful powder splash effects, high saturation rainbow hues, joyful festival atmosphere with gulaal particles in the air",
  "Navratri Garba": "Transform with Navratri Garba style, traditional attire aesthetics, festive motion blur of dancing, colorful chaniya choli patterns, and vibrant dandiya celebration atmosphere",
  "Rakhi Bond": "Transform with soft warm family tones, gentle golden hour lighting, rakhi thread details, traditional Indian family portrait aesthetic with loving warmth",
  "Eid Elegance": "Transform with elegant Eid celebration lighting, soft pastel tones, crescent moon motifs, ornate Islamic patterns, and refined festive atmosphere",
  "Durga Puja": "Transform with dramatic Durga Puja pandal lighting, rich Bengali cultural aesthetics, vermillion and gold tones, divine goddess energy, and traditional dhunuchi smoke atmosphere",
  "Tricolor Pride": "Transform with patriotic Indian tricolor grading, saffron white and green color scheme, proud national celebration atmosphere, flag motifs and freedom fighter aesthetic",
  "Ganpati Bappa": "Transform with Ganesh Chaturthi celebration style, modak and laddu aesthetics, vermillion and turmeric tones, traditional pandal lighting with Ganpati devotion atmosphere",
  "Christmas Magic": "Transform with cozy Christmas lighting, warm red and green holiday tones, snow effects, twinkling fairy lights, Santa aesthetic, and magical winter wonderland atmosphere",
  "New Year Glow": "Transform with neon New Year party glow, champagne gold sparkles, midnight celebration vibes, fireworks reflections, and glamorous countdown atmosphere",
  "Spooky Halloween": "Transform with dark cinematic Halloween aesthetic, spooky orange and purple tones, jack-o-lantern glow, haunted atmosphere, and mysterious gothic vibes",
  "Romantic Love": "Transform with romantic soft pink lighting, dreamy love aesthetic, rose petals, heart bokeh effects, and intimate couple portrait vibes",
  "Easter Spring": "Transform with bright Easter pastel tones, spring bloom aesthetic, soft bunny and egg motifs, fresh flower colors, and joyful spring celebration vibes",
  "Thanksgiving Warmth": "Transform with warm autumn Thanksgiving tones, harvest golden hour lighting, cozy family gathering aesthetic, fall leaves colors, and grateful celebration atmosphere",
  
  // Trending styles (auto-rotated)
  "Ghibli Style": "Transform into Studio Ghibli anime style with soft watercolor textures, magical atmosphere, whimsical details, and Hayao Miyazaki artistic aesthetic",
  "AI Portrait Pro": "Transform into hyper-realistic AI enhanced portrait with perfect skin, professional studio lighting, magazine cover quality, and celebrity photoshoot aesthetic",
  "3D Pixar Character": "Transform into 3D Pixar-style animated character with expressive features, smooth rendering, cartoon proportions, and Disney-quality animation look",
  "Retro 90s Anime": "Transform into classic 90s retro anime style with vintage cel animation look, nostalgic color palette, VHS grain texture, and old school anime aesthetics",
  "Cinematic Portrait": "Transform into cinematic movie still with dramatic lighting, film grain, anamorphic lens flare, Hollywood cinematography, and blockbuster movie poster aesthetic",
  "Cute Plushie": "Transform into adorable plush toy version with soft fabric texture, button eyes, stuffed toy proportions, kawaii aesthetic, and collectible figure style",
  "Ink Sketch Art": "Transform into detailed pen and ink sketch with fine line work, cross-hatching shading, artistic illustration style, and hand-drawn aesthetic",
  "Neon Cyberpunk": "Transform into futuristic cyberpunk style with neon pink and blue lighting, rain-soaked streets, holographic elements, and Blade Runner aesthetic",
  "Watercolor Dream": "Transform into soft watercolor painting with flowing color bleeds, artistic brush strokes, dreamy pastel palette, and fine art gallery aesthetic",
  "Pop Art Comic": "Transform into bold pop art comic style with Ben-Day dots, thick outlines, bright primary colors, Roy Lichtenstein aesthetic, and vintage comic book look",
  "Luxury Glam": "Transform into luxury fashion magazine editorial with high-end glamour, designer aesthetic, premium lighting, and Vogue cover quality",
  "Anime Waifu": "Transform into modern anime character style with expressive eyes, dynamic hair, clean line art, vibrant colors, and popular anime aesthetic"
};

// Discover prompts mapping
const discoverPrompts: Record<string, string> = {
  "Turn my apartment into a storybook": "Transform this apartment/room image into a magical storybook illustration with whimsical fantasy elements and fairy tale aesthetic",
  "Reimagine my pet as a human": "Transform this pet image into a humanized portrait, imagining how this pet would look as a human person with similar features and personality",
  "Make them Santa": "Transform this person into Santa Claus with full Santa costume, white beard, red suit, and Christmas atmosphere",
  "What would I look like as a K-pop star?": "Transform this person into a K-pop star style with idol makeup, trendy hairstyle, stylish outfit, and Korean pop star aesthetic",
  "Give us a matching outfit": "Create matching coordinated outfits for the people in this image with complementary styles and colors",
  "Style me": "Give this person a complete style makeover with fashionable outfit, trendy accessories, and modern styling",
  "Create a professional product photo": "Transform this into a professional product photography style with clean background, perfect lighting, and commercial aesthetic",
  "Create a holiday card": "Transform this image into a beautiful holiday greeting card design with festive elements and card-worthy composition",
  "Create a colouring page": "Transform this image into a black and white coloring page with clear outlines and fillable sections",
  "Redecorate my room": "Reimagine this room with new interior design, modern furniture, and fresh decoration style",
  "Turn into a keychain": "Transform this image into a cute keychain design with charm aesthetic and collectible style",
  "Create a cartoon": "Transform this image into a cartoon style with animated character look and colorful cartoon aesthetic",
  "Give them a bowl": "Add a cute bowl to the pet in this image, showing them with their food or water bowl",
  "Me as the Girl with a Pearl": "Transform this portrait in the style of Vermeer's 'Girl with a Pearl Earring' painting with similar composition, lighting, and artistic style",
  "Create a professional job photo": "Transform this into a professional corporate headshot suitable for LinkedIn or job applications with clean background and professional attire",
  "Remove people in the background": "Remove all people in the background of this image, keeping only the main subject and clean background"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, styleName, secondImageUrl, isDiscover } = await req.json();

    if (!imageUrl || !styleName) {
      return new Response(
        JSON.stringify({ error: "Image URL and style name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the appropriate prompt
    let prompt: string;
    if (isDiscover) {
      prompt = discoverPrompts[styleName] || `Apply this transformation: ${styleName}`;
    } else {
      prompt = stylePrompts[styleName] || `Transform this image in ${styleName} style`;
    }

    console.log("Processing style transformation:", { styleName, isDiscover });

    // Build message content
    const messageContent: any[] = [
      {
        type: "text",
        text: prompt
      },
      {
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      }
    ];

    // Add second image for Celebrity Style
    if (secondImageUrl && styleName === "Celebrity Style") {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: secondImageUrl
        }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Style transformation complete");

    // Extract the transformed image URL from the response
    const transformedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!transformedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No transformed image returned from AI");
    }

    return new Response(
      JSON.stringify({ 
        transformedImageUrl,
        message: data.choices?.[0]?.message?.content || "Style applied successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Style transform error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to transform image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
