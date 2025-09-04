import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/download-image:
 *   post:
 *     summary: Download an external image acting as a proxy
 *     description: >
 *       Receives the URL of an image, downloads it server-side, and returns it directly.
 *       Useful to bypass CORS issues when displaying images from external domains on the frontend.
 *     tags: [Utilities]
 *     requestBody:
 *       required: true
 *       description: Object containing the URL of the image to download.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Full and accessible URL of the image.
 *                 example: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
 *     responses:
 *       200:
 *         description: Image downloaded successfully. Response body contains the binary image data.
 *         headers:
 *           Content-Type:
 *             description: MIME type of the returned image (e.g., image/jpeg, image/png).
 *             schema:
 *               type: string
 *           Content-Disposition:
 *             description: Suggests the browser to download the file as an attachment.
 *             schema:
 *               type: string
 *               example: 'attachment; filename="image.jpg"'
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Raw binary image data.
 *       400:
 *         description: Bad request. URL was not provided or is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid URL"
 *       500:
 *         description: Server error. Failed to download the image from the external URL or internal error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error downloading the image"
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error downloading the image" },
        { status: 500 }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="image.jpg"`);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Error proxying image:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
