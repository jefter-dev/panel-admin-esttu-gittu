
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao baixar a imagem" }, { status: 500 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="imagem.jpg"`);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Erro ao fazer proxy da imagem:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
