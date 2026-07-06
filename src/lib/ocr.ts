import { createWorker } from "tesseract.js";

export async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker("kor+eng");

  try {
    const imageUrl = URL.createObjectURL(file);
    const result = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);

    const text = result.data.text.trim();

    console.log("OCR 추출 결과:", text);

    return text;
  } finally {
    await worker.terminate();
  }
}