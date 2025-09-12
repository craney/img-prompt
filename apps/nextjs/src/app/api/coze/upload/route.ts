import { NextRequest } from "next/server";
import { env } from "~/env.mjs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the access token from environment variables
    const accessToken = env.COZE_ACCESS_TOKEN;

    console.log("=== Coze API Request Details ===");
    console.log("URL: https://api.coze.cn/v1/files/upload");
    console.log("Method: POST");
    console.log("Access Token Present:", !!accessToken);
    console.log("Access Token Length:", accessToken ? accessToken.length : 0);
    if (accessToken) {
      console.log("Access Token:", accessToken);
    }
    console.log("Headers:", {
      "Authorization": accessToken ? `Bearer ${accessToken}` : 'NOT_SET',
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    });
    console.log("File Details:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    console.log("===============================");

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Coze access token not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare form data for Coze API
    const cozeFormData = new FormData();
    cozeFormData.append("file", file);
    cozeFormData.append("purpose", "webpage"); // Default purpose

    // Log form data entries
    console.log("Form Data Entries:");
    for (const [key, value] of cozeFormData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File { name: ${value.name}, size: ${value.size}, type: ${value.type} }`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Upload to Coze API
    const response = await fetch("https://api.coze.cn/v1/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      },
      body: cozeFormData,
    });

    console.log("=== Coze API Response Details ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    console.log("================================");

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("Coze API returned non-JSON response:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Coze API error", 
          details: "Invalid response format from Coze API",
          response: errorText.substring(0, 200) // First 200 chars
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Coze API Response Body:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("Coze API error:", result);
      return new Response(
        JSON.stringify({ 
          error: "Coze API error", 
          details: result.msg || result.error || "Unknown error from Coze API",
          code: result.code
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the file ID to the client
    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: result.data.id,  // 从data对象获取ID
        fileName: result.data.file_name,
        fileSize: result.data.bytes,
        fileType: result.data.file_name.split('.').pop()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading file to Coze:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to upload file to Coze",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}