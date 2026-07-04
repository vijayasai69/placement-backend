import pdfParse from "pdf-parse";

/**
 * Parses a PDF buffer and extracts text contents.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text || "";
}
