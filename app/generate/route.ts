import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Create a new ratelimiter, that allows 5 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(5, "1440 m"),
      analytics: true,
    })
  : undefined;

export async function POST(request: Request) {
  // Add CORS headers for Flutter frontend
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Rate Limiter Code
  if (ratelimit) {
    const headersList = headers();
    const ipIdentifier = headersList.get("x-real-ip");

    const result = await ratelimit.limit(ipIdentifier ?? "");

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Too many uploads in 1 day. Please try again in a 24 hours." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": result.limit,
            "X-RateLimit-Remaining": result.remaining,
            ...corsHeaders,
          } as any,
        }
      );
    }
  }

  try {
    // Parse the request body - expecting { imageUrl, room, theme }
    const { imageUrl, theme, room } = await request.json();

    // Validate required fields
    if (!imageUrl || !theme || !room) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, theme, and room are required" },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // POST request to Replicate to start the image restoration generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
        input: {
          image: imageUrl,
          prompt:
            room === "Gaming Room"
              ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
              : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
          a_prompt:
            "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
          n_prompt:
            "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
        },
      }),
    });

    let jsonStartResponse = await startResponse.json();

    // Check if the Replicate API call was successful
    if (!startResponse.ok) {
      return NextResponse.json(
        { error: "Failed to start image generation", details: jsonStartResponse },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    let endpointUrl = jsonStartResponse.urls.get;

    // GET request to get the status of the image restoration process & return the result when it's ready
    let restoredImage: string | null = null;
    while (!restoredImage) {
      // Loop in 1s intervals until the alt text is ready
      console.log("polling for result...");
      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
      });
      let jsonFinalResponse = await finalResponse.json();

      if (jsonFinalResponse.status === "succeeded") {
        restoredImage = jsonFinalResponse.output;
      } else if (jsonFinalResponse.status === "failed") {
        return NextResponse.json(
          { error: "Image generation failed", details: jsonFinalResponse },
          { 
            status: 500,
            headers: corsHeaders
          }
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Return the result in the specified format: { "output": "https://..." }
    return NextResponse.json(
      { output: restoredImage },
      { 
        status: 200,
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
