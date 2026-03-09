"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { SlideImage } from "@/lib/types";

interface DraggableImageProps {
  image: SlideImage;
  onChange: (updated: SlideImage) => void;
  onRemove: () => void;
  scale: number;
  interactive: boolean;
  slideWidth: number;
  slideHeight: number;
}

const MIN_SIZE = 40;

type Corner = "tl" | "tr" | "bl" | "br";

const CORNER_CURSORS: Record<Corner, string> = {
  tl: "nwse-resize",
  tr: "nesw-resize",
  bl: "nesw-resize",
  br: "nwse-resize",
};

const CORNER_POSITIONS: Record<Corner, { top?: number; bottom?: number; left?: number; right?: number }> = {
  tl: { top: -5, left: -5 },
  tr: { top: -5, right: -5 },
  bl: { bottom: -5, left: -5 },
  br: { bottom: -5, right: -5 },
};

export default function DraggableImage({
  image,
  onChange,
  onRemove,
  scale,
  interactive,
  slideWidth,
  slideHeight,
}: DraggableImageProps) {
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);
  const [localSize, setLocalSize] = useState<{ width: number; height: number } | null>(null);
  const [localResizePos, setLocalResizePos] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; imgX: number; imgY: number } | null>(null);
  const resizeRef = useRef<{
    startX: number; startY: number;
    imgX: number; imgY: number;
    imgW: number; imgH: number;
    corner: Corner;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = localResizePos?.x ?? localPos?.x ?? image.x;
  const y = localResizePos?.y ?? localPos?.y ?? image.y;
  const width = localSize?.width ?? image.width;
  const height = localSize?.height ?? image.height;

  // Click outside to deselect
  useEffect(() => {
    if (!interactive || !selected) return;
    const handleClickOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelected(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [interactive, selected]);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, imgX: image.x, imgY: image.y };
  }, [interactive, image.x, image.y]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) / scale;
    const dy = (e.clientY - dragRef.current.startY) / scale;
    const newX = Math.max(-image.width / 2, Math.min(slideWidth - image.width / 2, dragRef.current.imgX + dx));
    const newY = Math.max(-image.height / 2, Math.min(slideHeight - image.height / 2, dragRef.current.imgY + dy));
    setLocalPos({ x: newX, y: newY });
  }, [scale, slideWidth, slideHeight, image.width, image.height]);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    if (localPos) {
      onChange({ ...image, x: localPos.x, y: localPos.y });
    }
    dragRef.current = null;
    setLocalPos(null);
  }, [localPos, image, onChange]);

  const handleResizeStart = useCallback((corner: Corner, e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      imgX: image.x,
      imgY: image.y,
      imgW: image.width,
      imgH: image.height,
      corner,
    };
  }, [interactive, image.x, image.y, image.width, image.height]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const { corner, startX, startY, imgW, imgH, imgX, imgY } = resizeRef.current;
    const dx = (e.clientX - startX) / scale;
    const dy = (e.clientY - startY) / scale;

    let newWidth: number;
    let newX = imgX;
    let newY = imgY;

    // For corners on the right side, dragging right increases size
    // For corners on the left side, dragging left increases size
    if (corner === "br") {
      newWidth = Math.max(MIN_SIZE, imgW + dx);
    } else if (corner === "bl") {
      newWidth = Math.max(MIN_SIZE, imgW - dx);
      newX = imgX + (imgW - newWidth);
    } else if (corner === "tr") {
      newWidth = Math.max(MIN_SIZE, imgW + dx);
    } else {
      // tl
      newWidth = Math.max(MIN_SIZE, imgW - dx);
      newX = imgX + (imgW - newWidth);
    }

    const newHeight = newWidth / image.aspectRatio;

    // For top corners, adjust Y as height changes
    if (corner === "tl" || corner === "tr") {
      newY = imgY + (imgH - newHeight);
    }

    setLocalSize({ width: newWidth, height: newHeight });
    setLocalResizePos({ x: newX, y: newY });
  }, [scale, image.aspectRatio]);

  const handleResizeEnd = useCallback(() => {
    if (!resizeRef.current) return;
    const updatedImage = { ...image };
    if (localSize) {
      updatedImage.width = localSize.width;
      updatedImage.height = localSize.height;
    }
    if (localResizePos) {
      updatedImage.x = localResizePos.x;
      updatedImage.y = localResizePos.y;
    }
    onChange(updatedImage);
    resizeRef.current = null;
    setLocalSize(null);
    setLocalResizePos(null);
  }, [localSize, localResizePos, image, onChange]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        zIndex: 20,
        cursor: interactive ? "move" : "default",
        userSelect: "none",
      }}
      onPointerDown={interactive ? handleDragStart : undefined}
      onPointerMove={interactive ? handleDragMove : undefined}
      onPointerUp={interactive ? handleDragEnd : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.dataUrl}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          borderRadius: 8,
          filter: image.inverted ? "invert(1)" : undefined,
        }}
      />

      {interactive && selected && (
        <>
          {/* Selection border */}
          <div style={{
            position: "absolute",
            inset: -1,
            border: "2px solid #3b82f6",
            borderRadius: 10,
            pointerEvents: "none",
          }} />

          {/* Resize handles on all four corners */}
          {(["tl", "tr", "bl", "br"] as Corner[]).map((corner) => (
            <div
              key={corner}
              style={{
                position: "absolute",
                ...CORNER_POSITIONS[corner],
                width: 14,
                height: 14,
                backgroundColor: "#3b82f6",
                border: "2px solid white",
                borderRadius: 3,
                cursor: CORNER_CURSORS[corner],
                zIndex: 21,
              }}
              onPointerDown={(e) => handleResizeStart(corner, e)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
            />
          ))}
        </>
      )}
    </div>
  );
}
