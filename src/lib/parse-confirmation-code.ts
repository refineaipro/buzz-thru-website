export function parseConfirmationCodeFromScan(scanned: string): string | null {
  const trimmed = scanned.trim();

  try {
    const url = new URL(trimmed);
    const code = url.searchParams.get("code");
    if (code) return code.toUpperCase();
  } catch {
    try {
      const url = new URL(trimmed, "https://buzzthrucarwash.com");
      const code = url.searchParams.get("code");
      if (code) return code.toUpperCase();
    } catch {
      // Not a URL.
    }
  }

  const codeMatch = trimmed.match(/[?&]code=([A-Fa-f0-9]+)/i);
  if (codeMatch) return codeMatch[1].toUpperCase();

  if (/^[A-F0-9]{8}$/i.test(trimmed)) return trimmed.toUpperCase();

  return null;
}
