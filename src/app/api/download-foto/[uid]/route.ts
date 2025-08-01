import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

export async function GET(req: NextRequest, { params }: { params: { uid: string } }) {
  const uid = params.uid;

  try {
    // Ex: esttu ou gittu, adapte se quiser detectar automaticamente
    const app = "esttu";
    const firebaseApp = admin.app(app);
    const bucket = firebaseApp.storage().bucket();

    // Caminho da imagem no storage
    const filePath = `users/fotos/${uid}/documents/facePicture`;

    const file = bucket.file(filePath);

    const [buffer] = await file.download();

    const headers = new Headers();
    headers.set("Content-Type", "image/jpeg");
    headers.set("Content-Disposition", `attachment; filename="foto-${uid}.jpg"`);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Erro ao baixar imagem:", err);
    return NextResponse.json({ error: "Erro ao baixar imagem" }, { status: 500 });
  }
}
