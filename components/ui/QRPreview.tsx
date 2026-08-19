"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, QrCode } from "lucide-react";
import { Button } from "./Button";

export interface QRPreviewProps {
  url: string;
  tableNumber?: string;
  businessName?: string;
  size?: number;
}

export function QRPreview({
  url,
  tableNumber,
  businessName,
  size = 200,
}: QRPreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${businessName || "MenuGO"}_${tableNumber ? `Table_${tableNumber}` : "QR"}.svg`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const urlObj = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(urlObj);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${businessName || "MenuGO"}_${tableNumber ? `Table_${tableNumber}` : "QR"}.png`;
      a.click();
    };

    img.src = urlObj;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center">
      {/* Visual QR Container Card */}
      <div className="p-5 bg-white rounded-2xl border-2 border-slate-900 shadow-lg relative flex flex-col items-center space-y-3">
        {businessName && (
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-900 font-heading">
            {businessName}
          </p>
        )}

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner">
          <QRCodeSVG
            ref={svgRef}
            value={url || "https://menugo.in"}
            size={size}
            level="H"
            includeMargin={true}
          />
        </div>

        {tableNumber ? (
          <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black tracking-wider uppercase">
            Table {tableNumber}
          </div>
        ) : (
          <p className="text-[11px] font-semibold text-slate-500">Scan to View Menu</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSVG}
          leftIcon={<Download size={14} />}
        >
          Download SVG
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleDownloadPNG}
          leftIcon={<Download size={14} />}
        >
          Download PNG
        </Button>
      </div>
    </div>
  );
}
