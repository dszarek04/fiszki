import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compresses a base64 image string using HTML Canvas.
 * Resizes the image if its width exceeds maxWidth, and encodes it as JPEG with the specified quality.
 */
export async function compressImage(
  base64Str: string,
  maxWidth = 1000,
  quality = 0.85
): Promise<string> {
  if (!base64Str.startsWith('data:image/')) {
    return base64Str;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
