"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { parseConfirmationCodeFromScan } from "@/lib/parse-confirmation-code";

const SCANNER_ELEMENT_ID = "check-in-qr-scanner";

type QrScannerProps = {
  active: boolean;
  onScan: (code: string) => void;
  onError: (message: string) => void;
};

export function QrScanner({ active, onScan, onError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!active) {
      handledRef.current = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear();
            scannerRef.current = null;
          });
      }
      return;
    }

    handledRef.current = false;
    let cancelled = false;
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (handledRef.current || cancelled) return;

          const code = parseConfirmationCodeFromScan(decodedText);
          if (!code) {
            onErrorRef.current(
              "QR code not recognized. Use a Buzz Thru booking confirmation QR.",
            );
            return;
          }

          handledRef.current = true;
          onScanRef.current(code);
        },
        () => {
          // Ignore per-frame decode misses.
        },
      )
      .catch((error: unknown) => {
        if (cancelled) return;
        onErrorRef.current(
          error instanceof Error
            ? error.message
            : "Could not access the camera. Allow camera permission and try again.",
        );
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          scanner.clear();
          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }
        });
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-black">
      <div id={SCANNER_ELEMENT_ID} className="w-full [&_video]:rounded-xl" />
    </div>
  );
}
