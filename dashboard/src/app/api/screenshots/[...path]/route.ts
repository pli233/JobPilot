import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * GET /api/screenshots/[...path]
 *
 * Serve screenshot images from the data/screenshots directory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const imagePath = pathSegments.join("/");

    // Security: Only allow access to data/screenshots directory
    // Resolve the full path and ensure it's within allowed directory
    const projectRoot = process.cwd().replace("/packages/dashboard", "");
    const screenshotsDir = path.join(projectRoot, "data", "screenshots");
    const fullPath = path.join(screenshotsDir, path.basename(imagePath));

    // Ensure the resolved path is within the screenshots directory
    if (!fullPath.startsWith(screenshotsDir)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      // Try with the full path as provided (for backward compatibility)
      const altPath = path.join(projectRoot, imagePath);
      if (existsSync(altPath) && altPath.includes("data/screenshots")) {
        const buffer = await readFile(altPath);
        const ext = path.extname(altPath).toLowerCase();
        const mimeType = getMimeType(ext);

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      return NextResponse.json(
        { error: "Screenshot not found" },
        { status: 404 }
      );
    }

    const buffer = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = getMimeType(ext);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Screenshot serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve screenshot" },
      { status: 500 }
    );
  }
}

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
