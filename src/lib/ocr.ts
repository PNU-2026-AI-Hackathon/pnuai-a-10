import { createWorker } from "tesseract.js";

type PreparedImage = {
  url: string;
  revoke: () => void;
};

const MAX_IMAGE_EDGE = 3000;
const UPSCALE_TARGET_WIDTH = 1800;
const MOBILE_MAX_IMAGE_EDGE = 1600;
const MOBILE_UPSCALE_TARGET_WIDTH = 1200;
const CONTRAST = 1.16;

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const isMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  const isIPadOs =
    /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

  return isMobileUserAgent || isIPadOs;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("OCR 이미지를 불러오지 못했습니다."));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("OCR 전처리 이미지를 생성하지 못했습니다."));
    }, "image/png");
  });
}

async function prepareImage(
  sourceUrl: string,
  maxImageEdge = MAX_IMAGE_EDGE,
  upscaleTargetWidth = UPSCALE_TARGET_WIDTH
): Promise<PreparedImage> {
  const image = await loadImage(sourceUrl);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const desiredScale =
    image.naturalWidth < upscaleTargetWidth
      ? Math.min(2, upscaleTargetWidth / image.naturalWidth)
      : 1;
  const scale = Math.min(desiredScale, maxImageEdge / longestEdge);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("OCR 이미지 전처리를 시작하지 못했습니다.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const gray =
      pixels[index] * 0.299 +
      pixels[index + 1] * 0.587 +
      pixels[index + 2] * 0.114;
    const adjusted = Math.max(
      0,
      Math.min(255, (gray - 128) * CONTRAST + 128)
    );

    pixels[index] = adjusted;
    pixels[index + 1] = adjusted;
    pixels[index + 2] = adjusted;
  }

  context.putImageData(imageData, 0, 0);

  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);

  return {
    url,
    revoke: () => URL.revokeObjectURL(url),
  };
}

function normalizeOcrText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker("kor+eng");
  const sourceUrl = URL.createObjectURL(file);
  let preparedImage: PreparedImage | null = null;

  try {
    if (isMobileDevice()) {
      try {
        preparedImage = await prepareImage(
          sourceUrl,
          MOBILE_MAX_IMAGE_EDGE,
          MOBILE_UPSCALE_TARGET_WIDTH
        );
        const mobileResult = await worker.recognize(preparedImage.url);

        return normalizeOcrText(mobileResult.data.text);
      } catch (mobilePreprocessingError) {
        console.warn(
          "모바일 OCR 전처리에 실패해 원본 이미지를 인식합니다.",
          mobilePreprocessingError
        );
        const fallbackResult = await worker.recognize(sourceUrl);

        return normalizeOcrText(fallbackResult.data.text);
      }
    }

    const originalResult = await worker.recognize(sourceUrl);

    try {
      preparedImage = await prepareImage(sourceUrl);
      const preparedResult = await worker.recognize(preparedImage.url);
      const selectedResult =
        preparedResult.data.confidence > originalResult.data.confidence
          ? preparedResult
          : originalResult;

      return normalizeOcrText(selectedResult.data.text);
    } catch (preprocessingError) {
      console.warn(
        "OCR 이미지 전처리에 실패해 원본 인식 결과를 사용합니다.",
        preprocessingError
      );
      return normalizeOcrText(originalResult.data.text);
    }
  } finally {
    preparedImage?.revoke();
    URL.revokeObjectURL(sourceUrl);
    await worker.terminate();
  }
}
