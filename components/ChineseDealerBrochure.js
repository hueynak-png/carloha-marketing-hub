"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { brochureVehicles, defaultBrochureVehicleId } from "../lib/chineseDealerBrochureData";
import styles from "./ChineseDealerBrochure.module.css";

const specRows = [
  { key: "dimensions", label: "车身尺寸", marker: "MM" },
  { key: "tireSize", label: "轮胎尺寸", marker: "R20" },
  { key: "price", label: "售价", marker: "$" },
  { key: "warranty", label: "质保", marker: "6Y" },
  { key: "maintenance", label: "送免费保养", marker: "24X" },
];

function getSpecMarker(row, specs) {
  if (row.key === "tireSize") {
    const sizeMatch = specs.tireSize.match(/R\s*\d+/i);
    return sizeMatch ? sizeMatch[0].replace(/\s+/g, "").toUpperCase() : row.marker;
  }

  if (row.key === "maintenance" && specs.maintenance === "待确认") {
    return "?";
  }

  return row.marker;
}

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function cloneVehicle(vehicle) {
  return {
    ...vehicle,
    specs: { ...vehicle.specs },
    images: vehicle.images.map(image => ({ ...image })),
  };
}

function EditableText({ value, className, onChange, multiline = false }) {
  function handleBlur(event) {
    const nextValue = event.currentTarget.innerText;
    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  return (
    <span
      className={`${styles.editableText} ${className || ""}`}
      contentEditable
      role="textbox"
      aria-multiline={multiline}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={handleBlur}
    >
      {value}
    </span>
  );
}

async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(images.map(async image => {
    if (image.complete && image.naturalWidth > 0) return;

    if (typeof image.decode === "function") {
      try {
        await image.decode();
        return;
      } catch {
        // Fall through to the load/error listeners for browsers that reject decode early.
      }
    }

    await new Promise(resolve => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
}

function ImageSlot({
  image,
  className,
  dragIndex,
  dropIndex,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onReplace,
}) {
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const slotRef = useRef(null);
  const [slotSize, setSlotSize] = useState(null);
  const [imageSize, setImageSize] = useState(null);

  function updateImageSizeFromElement(element) {
    if (!element?.naturalWidth || !element?.naturalHeight) return;

    setImageSize({
      width: element.naturalWidth,
      height: element.naturalHeight,
    });
  }

  useEffect(() => {
    if (!slotRef.current) return undefined;

    function updateSlotSize() {
      const rect = slotRef.current.getBoundingClientRect();
      setSlotSize({ width: rect.width, height: rect.height });
    }

    updateSlotSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateSlotSize);
      observer.observe(slotRef.current);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateSlotSize);
    return () => window.removeEventListener("resize", updateSlotSize);
  }, []);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return undefined;
    const handleLoad = () => updateImageSizeFromElement(imageElement);

    updateImageSizeFromElement(imageElement);
    imageElement.addEventListener("load", handleLoad);

    return () => {
      imageElement.removeEventListener("load", handleLoad);
    };
  }, [image.src]);

  const coverImageStyle = useMemo(() => {
    if (!slotSize || !imageSize || !slotSize.height || !imageSize.height) {
      return { width: "100%", height: "100%" };
    }

    const slotAspect = slotSize.width / slotSize.height;
    const imageAspect = imageSize.width / imageSize.height;

    return imageAspect > slotAspect
      ? { width: "auto", height: "100%" }
      : { width: "100%", height: "auto" };
  }, [imageSize, slotSize]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onReplace(image.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <figure
      ref={slotRef}
      className={`${styles.imageSlot} ${className || ""} ${isDragging ? styles.dragging : ""} ${isDropTarget ? styles.dropTarget : ""}`}
      draggable
      onDragStart={event => onDragStart(event, dragIndex)}
      onDragOver={event => onDragOver(event, dropIndex)}
      onDrop={event => onDrop(event, dropIndex)}
      onDragEnd={onDragEnd}
    >
      <img
        ref={imageRef}
        className={styles.imageCanvas}
        src={image.src}
        alt={image.label}
        decoding="async"
        draggable={false}
        style={coverImageStyle}
        onLoad={event => updateImageSizeFromElement(event.currentTarget)}
      />
      <span className={styles.dragHint}>Drag</span>
      <button
        className={styles.replaceButton}
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        Replace Image
      </button>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </figure>
  );
}

export default function ChineseDealerBrochure() {
  const [selectedVehicleId, setSelectedVehicleId] = useState(defaultBrochureVehicleId);
  const [vehicleStateById, setVehicleStateById] = useState(() => (
    Object.fromEntries(
      Object.entries(brochureVehicles).map(([id, vehicle]) => [id, cloneVehicle(vehicle)]),
    )
  ));
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPdfShare, setPendingPdfShare] = useState(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const brochureRef = useRef(null);

  const vehicleOptions = useMemo(() => Object.entries(brochureVehicles), []);
  const currentVehicle = vehicleStateById[selectedVehicleId];
  const visibleSpecRows = specRows.filter(row => currentVehicle.specs[row.key]);
  const visibleImages = currentVehicle.images.slice(0, 7);
  const heroImage = visibleImages[0];
  const gridImages = visibleImages.slice(1);

  function updateCurrentVehicle(updater) {
    setVehicleStateById(current => ({
      ...current,
      [selectedVehicleId]: updater(current[selectedVehicleId]),
    }));
  }

  function updateTitle(value) {
    updateCurrentVehicle(vehicle => ({ ...vehicle, title: value }));
  }

  function updateSpec(key, value) {
    updateCurrentVehicle(vehicle => ({
      ...vehicle,
      specs: {
        ...vehicle.specs,
        [key]: value,
      },
    }));
  }

  function replaceImage(imageId, src) {
    updateCurrentVehicle(vehicle => ({
      ...vehicle,
      images: vehicle.images.map(image => (
        image.id === imageId ? { ...image, src } : image
      )),
    }));
  }

  function moveImage(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    updateCurrentVehicle(vehicle => {
      const images = [...vehicle.images];
      const [movedImage] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, movedImage);
      return {
        ...vehicle,
        images,
      };
    });
  }

  function handleImageDragStart(event, index) {
    setDraggedImageIndex(index);
    setDropTargetIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleImageDragOver(event, index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  }

  function handleImageDrop(event, index) {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(fromIndex)) {
      moveImage(fromIndex, index);
    }
    setDraggedImageIndex(null);
    setDropTargetIndex(null);
  }

  function handleImageDragEnd() {
    setDraggedImageIndex(null);
    setDropTargetIndex(null);
  }

  async function sharePendingPdf() {
    if (!pendingPdfShare) return;

    if (navigator.canShare?.({ files: [pendingPdfShare.file] }) && navigator.share) {
      try {
        await navigator.share({
          files: [pendingPdfShare.file],
          title: pendingPdfShare.fileName,
        });
        setPendingPdfShare(null);
      } catch (error) {
        if (error?.name !== "AbortError") {
          downloadBlob(pendingPdfShare.file, pendingPdfShare.fileName);
        }
      }
      return;
    }

    downloadBlob(pendingPdfShare.file, pendingPdfShare.fileName);
    setPendingPdfShare(null);
  }

  async function downloadPdf() {
    if (!brochureRef.current) return;

    setPendingPdfShare(null);
    setIsExporting(true);
    await new Promise(resolve => window.requestAnimationFrame(resolve));
    await waitForImages(brochureRef.current);
    await new Promise(resolve => window.requestAnimationFrame(resolve));

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    try {
      const canvas = await html2canvas(brochureRef.current, {
        backgroundColor: "#ffffff",
        scale: 5,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        logging: false,
        windowWidth: brochureRef.current.scrollWidth,
        windowHeight: brochureRef.current.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: false,
      });
      const imageData = canvas.toDataURL("image/png");
      pdf.addImage(imageData, "PNG", 0, 0, 210, 297, undefined, "NONE");
      const fileName = `${currentVehicle.label || selectedVehicleId}-Chinese-Dealer-Brochure.pdf`;

      if (isIOSDevice() && typeof File === "function") {
        const file = new File([pdf.output("blob")], fileName, { type: "application/pdf" });
        setPendingPdfShare({ file, fileName });
        return;
      }

      pdf.save(fileName);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.controlGroup}>
          <label htmlFor="brochureVehicle">Model</label>
          <select
            id="brochureVehicle"
            value={selectedVehicleId}
            onChange={event => setSelectedVehicleId(event.target.value)}
          >
            {vehicleOptions.map(([id, vehicle]) => (
              <option key={id} value={id}>{vehicle.label}</option>
            ))}
          </select>
        </div>

        <button className={styles.downloadButton} type="button" onClick={downloadPdf} disabled={isExporting}>
          {isExporting ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>

      {pendingPdfShare ? (
        <div className={styles.savePrompt} role="status">
          <span>{pendingPdfShare.fileName}</span>
          <button type="button" onClick={sharePendingPdf}>Save PDF</button>
          <button type="button" onClick={() => setPendingPdfShare(null)}>Cancel</button>
        </div>
      ) : null}

      <section className={styles.previewRail} aria-label="Chinese dealer brochure preview">
        <div
          className={`${styles.pageShell} ${isExporting ? styles.exportingShell : ""}`}
        >
          <article
            ref={brochureRef}
            className={`${styles.a4Page} ${isExporting ? styles.exporting : ""}`}
          >
          <div className={styles.topAccent} />
          <div className={styles.bottomAccent} />

          <header className={styles.header}>
            <EditableText
              value={currentVehicle.title}
              className={styles.title}
              multiline
              onChange={updateTitle}
            />
            <img className={styles.logo} src={currentVehicle.logo} alt="Chery Carloha logo" />
          </header>

          <section className={styles.heroRow}>
            <div className={styles.specCard}>
              {visibleSpecRows.map(row => (
                <div className={styles.specRow} key={row.key}>
                  <span className={styles.specMarker}>{getSpecMarker(row, currentVehicle.specs)}</span>
                  <div className={styles.specCopy}>
                    <span className={styles.specLabel}>{row.label}：</span>
                    <EditableText
                      value={currentVehicle.specs[row.key]}
                      className={row.key === "price" || row.key === "warranty" || row.key === "maintenance" ? styles.strongValue : styles.specValue}
                      multiline={row.key !== "dimensions" && row.key !== "tireSize"}
                      onChange={value => updateSpec(row.key, value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <ImageSlot
              image={heroImage}
              className={styles.heroImage}
              dragIndex={0}
              dropIndex={0}
              isDragging={draggedImageIndex === 0}
              isDropTarget={dropTargetIndex === 0 && draggedImageIndex !== null}
              onDragStart={handleImageDragStart}
              onDragOver={handleImageDragOver}
              onDrop={handleImageDrop}
              onDragEnd={handleImageDragEnd}
              onReplace={replaceImage}
            />
          </section>

          <section className={styles.imageGrid}>
            {gridImages.map((image, index) => {
              const imageIndex = index + 1;
              return (
              <ImageSlot
                key={image.id}
                image={image}
                dragIndex={imageIndex}
                dropIndex={imageIndex}
                isDragging={draggedImageIndex === imageIndex}
                isDropTarget={dropTargetIndex === imageIndex && draggedImageIndex !== null}
                onDragStart={handleImageDragStart}
                onDragOver={handleImageDragOver}
                onDrop={handleImageDrop}
                onDragEnd={handleImageDragEnd}
                onReplace={replaceImage}
              />
              );
            })}
          </section>
          </article>
        </div>
      </section>
    </main>
  );
}
