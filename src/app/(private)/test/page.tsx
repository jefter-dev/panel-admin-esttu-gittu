"use client"; // importante no app router

import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button"; // exemplo se usar shadcn/ui

export default function PdfExample() {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Conteúdo do PDF
    doc.setFontSize(16);
    doc.text("Hello, jsPDF + Next.js!", 10, 20);

    doc.setFontSize(12);
    doc.text("Esse PDF foi gerado no cliente.", 10, 30);

    // Baixar o arquivo
    doc.save("exemplo.pdf");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">Gerar PDF com jsPDF</h1>
      <Button onClick={generatePDF}>Baixar PDF</Button>
    </div>
  );
}
