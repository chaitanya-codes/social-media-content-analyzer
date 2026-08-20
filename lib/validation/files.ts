export const MAX_FILE_SIZE = 10 * 1024 * 1024;
const imageTypes = ["image/png", "image/jpeg", "image/webp"];
export function validateFile(file: File) {
  if (!file || file.size === 0) return "This file is empty. Choose a file with some content.";
  if (file.size > MAX_FILE_SIZE) return "That file is larger than 10 MB. Choose a smaller file.";
  const valid = file.type === "application/pdf" || imageTypes.includes(file.type);
  if (!valid) return "This file type isn't supported. Try a PDF, PNG, JPG, JPEG or WebP file.";
  return null;
}
