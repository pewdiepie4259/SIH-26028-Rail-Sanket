import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  RefreshCw,
  Crop as CropIcon,
  Move,
  Eye,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  userName?: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  userName = "Passenger",
  onClose,
  onCropComplete,
}) => {
  // Crop & Transform state
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewShape, setPreviewShape] = useState<"square" | "circle">("square");
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");

  // Dimensions
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const dragStartRef = useRef<{ clientX: number; clientY: number; posX: number; posY: number }>({
    clientX: 0,
    clientY: 0,
    posX: 0,
    posY: 0,
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const cropBoxSize = 280; // 280x280px viewport crop square

  // Reset transforms whenever a new image is loaded
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPosition({ x: 0, y: 0 });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      imgRef.current = img;
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Calculate base scale so image covers the 280x280 box
  const baseScale = React.useMemo(() => {
    if (!imageNaturalSize.width || !imageNaturalSize.height) return 1;
    // Account for 90 or 270 degree rotation where width and height swap
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const effectiveWidth = isRotated90or270 ? imageNaturalSize.height : imageNaturalSize.width;
    const effectiveHeight = isRotated90or270 ? imageNaturalSize.width : imageNaturalSize.height;

    return Math.max(cropBoxSize / effectiveWidth, cropBoxSize / effectiveHeight);
  }, [imageNaturalSize, rotation]);

  // Generate real-time live preview
  const generateCanvasCrop = useCallback(
    (outputSize = 512): string | null => {
      if (!imgRef.current || !imageNaturalSize.width || !imageNaturalSize.height) return null;

      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const scaleFactor = outputSize / cropBoxSize;

      // Translate to canvas center + scaled user position
      ctx.translate(
        outputSize / 2 + position.x * scaleFactor,
        outputSize / 2 + position.y * scaleFactor
      );

      // Apply rotation & flip
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, 1);

      // Render image centered on translated coordinates
      const drawWidth = imageNaturalSize.width * baseScale * zoom * scaleFactor;
      const drawHeight = imageNaturalSize.height * baseScale * zoom * scaleFactor;

      ctx.drawImage(
        imgRef.current,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      return canvas.toDataURL("image/jpeg", 0.92);
    },
    [imageNaturalSize, baseScale, zoom, rotation, flipH, position]
  );

  // Debounce small live preview generation
  useEffect(() => {
    if (!isOpen || !imageNaturalSize.width) return;
    const timer = setTimeout(() => {
      const live = generateCanvasCrop(180);
      if (live) setPreviewDataUrl(live);
    }, 60);
    return () => clearTimeout(timer);
  }, [isOpen, imageNaturalSize, generateCanvasCrop]);

  // Pointer/Mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    setPosition({
      x: Math.round(dragStartRef.current.posX + dx),
      y: Math.round(dragStartRef.current.posY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(3, Math.max(1, +(prev + delta).toFixed(2))));
  };

  // Actions
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipH((prev) => !prev);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    const cropped = generateCanvasCrop(512);
    if (cropped) {
      onCropComplete(cropped);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentScale = baseScale * zoom;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crop Profile Picture"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#F59E0B]/50 bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 sm:px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-[#F59E0B]">
              <CropIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Crop & Adjust Profile Picture
              </h3>
              <p className="text-[11px] text-[#D7E5EC]">
                Position, zoom, and rotate to fit your passenger avatar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close crop modal"
            className="rounded-xl p-2 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/60">
          {/* Main Interactive Cropper Stage */}
          <div className="flex flex-col items-center">
            {/* Crop Stage Box */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              style={{ width: `${cropBoxSize}px`, height: `${cropBoxSize}px` }}
              className={`relative overflow-hidden bg-slate-900 shadow-inner select-none touch-none cursor-grab active:cursor-grabbing border-2 border-[#0E7C86] ${
                previewShape === "circle" ? "rounded-full ring-4 ring-[#0E7C86]/30" : "rounded-3xl ring-4 ring-[#0E7C86]/30"
              }`}
            >
              {/* The Transformable Image */}
              {imageSrc && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: `${imageNaturalSize.width * currentScale}px`,
                    height: `${imageNaturalSize.height * currentScale}px`,
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${rotation}deg) scale(${
                      flipH ? -1 : 1
                    }, 1)`,
                    transformOrigin: "center center",
                    pointerEvents: "none",
                  }}
                  className="transition-[filter] duration-75"
                >
                  <img
                    src={imageSrc}
                    alt="Crop preview source"
                    className="h-full w-full object-fill pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Rule-of-Thirds Grid Overlay */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-r border-b border-white/25" />
                <div className="border-b border-white/25" />
                <div className="border-r border-white/25" />
                <div className="border-r border-white/25" />
                <div />
              </div>

              {/* Center Crosshair Anchor */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                <Move size={22} className="text-white" />
              </div>

              {/* Corner Bracket Accents (Only on square mode) */}
              {previewShape === "square" && (
                <>
                  <div className="pointer-events-none absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-[#F59E0B]" />
                  <div className="pointer-events-none absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-[#F59E0B]" />
                  <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#F59E0B]" />
                  <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#F59E0B]" />
                </>
              )}
            </div>

            {/* Hint Under Crop Box */}
            <p className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Move size={12} className="text-[#0E7C86]" />
              <span>Drag to reposition photo • Scroll to zoom</span>
            </p>
          </div>

          {/* Controls: Zoom Slider + Quick Buttons */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                className="text-slate-500 hover:text-[#071A33] p-1 cursor-pointer transition"
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                aria-label="Zoom scale"
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E7C86]"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
                className="text-slate-500 hover:text-[#071A33] p-1 cursor-pointer transition"
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>

              <span className="w-12 text-right font-mono text-xs font-bold text-[#0E7C86]">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Action Buttons: Rotate, Flip, Reset, Shape Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0E7C86] hover:bg-[#E7F4F5] hover:text-[#0E5961] transition cursor-pointer shadow-2xs"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw size={13} />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlip}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0E7C86] hover:bg-[#E7F4F5] hover:text-[#0E5961] transition cursor-pointer shadow-2xs"
                  title="Flip horizontally"
                >
                  <FlipHorizontal size={13} />
                  <span>Flip</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
                  title="Reset adjustments"
                >
                  <RefreshCw size={12} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>

              {/* Preview Mask Shape Toggle */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewShape("square")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    previewShape === "square"
                      ? "bg-white text-[#071A33] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Square
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewShape("circle")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    previewShape === "circle"
                      ? "bg-white text-[#071A33] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Circle
                </button>
              </div>
            </div>
          </div>

          {/* Live Mini Preview Bar */}
          {previewDataUrl && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-[#FFFDF9] p-3 shadow-2xs">
              <div className="flex items-center gap-3">
                {/* Rounded profile preview matching profile page */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-[#0E7C86] shadow-sm">
                  <img
                    src={previewDataUrl}
                    alt="Square live preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Circular preview */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-amber-400 shadow-sm">
                  <img
                    src={previewDataUrl}
                    alt="Circle live preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="hidden sm:block">
                  <div className="text-xs font-black text-[#071A33] leading-tight">
                    {userName}
                  </div>
                  <div className="text-[10px] font-semibold text-[#0E7C86] flex items-center gap-1">
                    <Eye size={11} />
                    <span>Live Avatar Output (512×512 HD)</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Ready to Apply
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 sm:px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl border border-[#F59E0B] bg-gradient-to-r from-[#071A33] via-[#0E5961] to-[#071A33] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-[0_4px_14px_rgba(14,89,97,0.3)] cursor-pointer"
          >
            <Check size={15} className="text-[#F59E0B]" />
            <span>Crop & Save Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
