/**
 * @swagger
 * /api/download-image:
 *   post:
 *     summary: Faz o download de uma imagem externa atuando como um proxy
 *     description: >
 *       Recebe a URL de uma imagem, faz o download no lado do servidor e a retorna diretamente.
 *       Isso é útil para contornar problemas de CORS ao tentar exibir imagens de domínios externos no frontend.
 *     tags:
 *       - Utilidades
 *     requestBody:
 *       required: true
 *       description: Objeto contendo a URL da imagem a ser baixada.
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
 *                 description: A URL completa e acessível da imagem.
 *                 example: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
 *     responses:
 *       '200':
 *         description: Imagem baixada com sucesso. O corpo da resposta contém os dados binários da imagem.
 *         headers:
 *           'Content-Type':
 *             description: O tipo MIME da imagem retornada (ex. image/jpeg, image/png).
 *             schema:
 *               type: string
 *           'Content-Disposition':
 *             description: Sugere ao navegador que o arquivo deve ser baixado (attachment).
 *             schema:
 *               type: string
 *               example: 'attachment; filename="imagem.jpg"'
 *         content:
 *           # Usamos um tipo genérico para dados binários
 *           'application/octet-stream':
 *             schema:
 *               type: string
 *               format: binary
 *               description: Os dados brutos da imagem.
 *
 *       '400':
 *         description: Requisição malformada. A URL não foi fornecida ou é inválida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "URL inválida"
 *
 *       '500':
 *         description: Erro no servidor. Ocorreu uma falha ao tentar baixar a imagem da URL externa ou um erro interno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao baixar a imagem"
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao baixar a imagem" },
        { status: 500 }
      );
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
