"use client";

import { useMemo, useRef, useState } from "react";
import { brochureVehicles, defaultBrochureVehicleId } from "../lib/chineseDealerBrochureData";
import styles from "./ChineseDealerBrochure.module.css";

const specRows = [
  { key: "dimensions", label: "车身尺寸", marker: "MM" },
  { key: "tireSize", label: "轮胎尺寸", marker: "R20" },
  { key: "price", label: "售价", marker: "$" },
  { key: "warranty", label: "质保", marker: "6Y" },
  { key: "maintenance", label: "送免费保养", marker: "24X" },
];

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
      className={`${styles.imageSlot} ${className || ""} ${isDragging ? styles.dragging : ""} ${isDropTarget ? styles.dropTarget : ""}`}
      draggable
      onDragStart={event => onDragStart(event, dragIndex)}
      onDragOver={event => onDragOver(event, dropIndex)}
      onDrop={event => onDrop(event, dropIndex)}
      onDragEnd={onDragEnd}
    >
      <span
        className={styles.imageCanvas}
        role="img"
        aria-label={image.label}
        style={{ backgroundImage: `url("${image.src}")` }}
      />
      <img className={styles.sourceImage} src={image.src} alt="" aria-hidden="true" />
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
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const brochureRef = useRef(null);

  const vehicleOptions = useMemo(() => Object.entries(brochureVehicles), []);
  const currentVehicle = vehicleStateById[selectedVehicleId];
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

  async function downloadPdf() {
    if (!brochureRef.current) return;

    setIsExporting(true);
    await new Promise(resolve => window.requestAnimationFrame(resolve));

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    try {
      const canvas = await html2canvas(brochureRef.current, {
        backgroundColor: "#ffffff",
        scale: 4,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
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
      pdf.addImage(imageData, "PNG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`${currentVehicle.label || selectedVehicleId}-Chinese-Dealer-Brochure.pdf`);
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

      <section className={styles.previewRail} aria-label="Chinese dealer brochure preview">
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
              {specRows.map(row => (
                <div className={styles.specRow} key={row.key}>
                  <span className={styles.specMarker}>{row.marker}</span>
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
      </section>
    </main>
  );
}
