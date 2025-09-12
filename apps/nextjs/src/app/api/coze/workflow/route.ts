import { NextRequest } from "next/server";
import { env } from "~/env.mjs";

// Helper functions for consistent error responses
function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function successResponse(data: any) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. 获取请求参数
    const { fileId, promptType } = await request.json();

    // 2. 验证参数
    if (!fileId || !promptType) {
      return errorResponse(400, "Missing required parameters: fileId and promptType");
    }

    // 3. 获取访问令牌
    const accessToken = env.COZE_ACCESS_TOKEN;
    if (!accessToken) {
      return errorResponse(500, "Coze access token not configured");
    }

    // 4. 准备工作流请求参数
    const workflowParams = {
      workflow_id: "7548376142701658148", // 固定的工作流ID
      parameters: {
        img: { file_id: fileId },
        promptType: promptType
      }
    };

    console.log("=== Coze Workflow Request Details ===");
    console.log("URL: https://api.coze.cn/v1/workflow/run");
    console.log("Method: POST");
    console.log("Access Token Present:", !!accessToken);
    console.log("Access Token Length:", accessToken ? accessToken.length : 0);
    console.log("Workflow Parameters:", JSON.stringify(workflowParams, null, 2));
    console.log("Headers:", {
      "Authorization": accessToken ? `Bearer ${accessToken}` : 'NOT_SET',
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    });
    console.log("================================");

    // 5. 调用Coze工作流API
    const response = await fetch("https://api.coze.cn/v1/workflow/run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      },
      body: JSON.stringify(workflowParams),
    });

    console.log("=== Coze Workflow Response Details ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    console.log("================================");

    // 6. 处理响应
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coze Workflow API error:", errorText);
      return errorResponse(response.status, `Coze Workflow API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Coze Workflow API Response Body:", JSON.stringify(result, null, 2));
    
    // 7. 解析提示词结果
    let prompt = "";
    if (result.data) {
      try {
        const data = JSON.parse(result.data);
        prompt = data.prompt || "";
      } catch (e) {
        // 如果解析失败，直接使用data作为提示词
        prompt = result.data;
      }
    }

    return successResponse({ prompt, debugUrl: result.debug_url });
    
  } catch (error) {
    console.error("Error calling Coze workflow:", error);
    return errorResponse(500, "Failed to call Coze workflow");
  }
}