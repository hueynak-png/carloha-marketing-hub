"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  brochureVehicles,
  defaultBrochureVehicleId,
  promotionBrochureDefaults,
} from "../lib/chineseDealerBrochureData";
import styles from "./ChineseDealerBrochure.module.css";

const specRows = [
  { key: "dimensions", label: { CN: "车身尺寸", EN: "Size" }, marker: "MM" },
  { key: "tireSize", label: { CN: "轮胎尺寸", EN: "Tires" }, marker: "R20" },
  { key: "price", label: { CN: "售价", EN: "Price" }, marker: "$" },
  { key: "warranty", label: { CN: "质保", EN: "Warranty" }, marker: "6Y" },
  { key: "maintenance", label: { CN: "送免费保养", EN: "Maintenance" }, marker: "24X" },
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
    copy: {
      CN: {
        title: vehicle.copy.CN.title,
        specs: { ...vehicle.copy.CN.specs },
      },
      EN: {
        title: vehicle.copy.EN.title,
        specs: { ...vehicle.copy.EN.specs },
      },
    },
    images: vehicle.images.map(image => ({ ...image })),
  };
}

function clonePromotionBrochure(brochure) {
  return {
    ...brochure,
    footerNotes: [...brochure.footerNotes],
    vehicles: brochure.vehicles.map(vehicle => ({
      ...vehicle,
      image: { ...vehicle.image },
    })),
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
  draggable = true,
  fit = "cover",
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

    if (fit === "contain") {
      return imageAspect > slotAspect
        ? { width: "100%", height: "auto" }
        : { width: "auto", height: "100%" };
    }

    return imageAspect > slotAspect
      ? { width: "auto", height: "100%" }
      : { width: "100%", height: "auto" };
  }, [fit, imageSize, slotSize]);

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
      draggable={draggable}
      onDragStart={draggable ? event => onDragStart(event, dragIndex) : undefined}
      onDragOver={draggable ? event => onDragOver(event, dropIndex) : undefined}
      onDrop={draggable ? event => onDrop(event, dropIndex) : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
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
      {draggable ? <span className={styles.dragHint}>Drag</span> : null}
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

function PromotionTemplate({ brochure, onUpdate, onReplaceImage }) {
  function updateField(key, value) {
    onUpdate(current => ({ ...current, [key]: value }));
  }

  function updateVehicle(vehicleId, key, value) {
    onUpdate(current => ({
      ...current,
      vehicles: current.vehicles.map(vehicle => (
        vehicle.id === vehicleId ? { ...vehicle, [key]: value } : vehicle
      )),
    }));
  }

  function updateFooterNote(index, value) {
    onUpdate(current => ({
      ...current,
      footerNotes: current.footerNotes.map((note, noteIndex) => (
        noteIndex === index ? value : note
      )),
    }));
  }

  return (
    <article className={`${styles.a4Page} ${styles.promotionPage}`}>
      <div className={styles.promotionWatermark} />
      <div className={styles.promotionTopRibbon} />
      <div className={styles.promotionSideGlow} />
      <header className={styles.promotionHeader}>
        <img className={styles.promotionLogo} src={brochure.logo} alt="Carloha logo" />
        <EditableText value={brochure.subheading} className={styles.promotionSubheading} onChange={value => updateField("subheading", value)} />
        <EditableText value={brochure.heading} className={styles.promotionHeading} onChange={value => updateField("heading", value)} />
      </header>

      <section className={styles.promotionVehicleList}>
        {brochure.vehicles.map((vehicle, index) => (
          <article className={styles.promotionVehicle} key={vehicle.id}>
            <div className={styles.promotionVisual}>
              <span className={styles.promotionVehicleNumber}>{String(index + 1).padStart(2, "0")}</span>
              <EditableText value={vehicle.name} className={styles.promotionVehicleName} onChange={value => updateVehicle(vehicle.id, "name", value)} />
              <ImageSlot image={vehicle.image} className={styles.promotionVehicleImage} onReplace={onReplaceImage} draggable={false} fit="contain" />
            </div>
            <div className={styles.promotionDetails}>
              <strong className={styles.promotionSpecsTitle}>SPECIFICATIONS</strong>
              <EditableText value={vehicle.specs} className={styles.promotionSpecs} multiline onChange={value => updateVehicle(vehicle.id, "specs", value)} />
              <div className={styles.promotionPrices}>
                <div>
                  <span>PRICE</span>
                  <EditableText value={vehicle.price} className={styles.promotionPrice} onChange={value => updateVehicle(vehicle.id, "price", value)} />
                </div>
                <div>
                  <span>PROMO / PRE ORDER</span>
                  <EditableText value={vehicle.promoPrice} className={styles.promotionPromoPrice} onChange={value => updateVehicle(vehicle.id, "promoPrice", value)} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.promotionFooter}>
        <div>
          <ul className={styles.promotionNotes}>
            {brochure.footerNotes.map((note, index) => (
              <li key={index}><EditableText value={note} onChange={value => updateFooterNote(index, value)} /></li>
            ))}
          </ul>
          <div className={styles.promotionContact}>
            <EditableText value={brochure.contactLabel} className={styles.promotionContactLabel} onChange={value => updateField("contactLabel", value)} />
            <EditableText value={brochure.contactValue} className={styles.promotionContactValue} onChange={value => updateField("contactValue", value)} />
          </div>
        </div>
        <div className={styles.promotionLocations}>
          <EditableText value={brochure.locations} multiline onChange={value => updateField("locations", value)} />
          <EditableText value={brochure.website} className={styles.promotionWebsite} onChange={value => updateField("website", value)} />
        </div>
      </footer>
      <div className={styles.promotionBottomBar} />
    </article>
  );
}

export default function ChineseDealerBrochure() {
  const [templateId, setTemplateId] = useState("singleVehicle");
  const [selectedVehicleId, setSelectedVehicleId] = useState(defaultBrochureVehicleId);
  const [brochureLanguage, setBrochureLanguage] = useState("CN");
  const [vehicleStateById, setVehicleStateById] = useState(() => (
    Object.fromEntries(
      Object.entries(brochureVehicles).map(([id, vehicle]) => [id, cloneVehicle(vehicle)]),
    )
  ));
  const [promotionBrochure, setPromotionBrochure] = useState(() => clonePromotionBrochure(promotionBrochureDefaults));
  const [isExporting, setIsExporting] = useState(false);
  const [pendingPdfShare, setPendingPdfShare] = useState(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const brochureRef = useRef(null);

  const vehicleOptions = useMemo(() => Object.entries(brochureVehicles), []);
  const currentVehicle = vehicleStateById[selectedVehicleId];
  const currentCopy = currentVehicle.copy[brochureLanguage];
  const visibleSpecRows = specRows.filter(row => currentCopy.specs[row.key]);
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
    updateCurrentVehicle(vehicle => ({
      ...vehicle,
      copy: {
        ...vehicle.copy,
        [brochureLanguage]: {
          ...vehicle.copy[brochureLanguage],
          title: value,
        },
      },
    }));
  }

  function updateSpec(key, value) {
    updateCurrentVehicle(vehicle => ({
      ...vehicle,
      copy: {
        ...vehicle.copy,
        [brochureLanguage]: {
          ...vehicle.copy[brochureLanguage],
          specs: {
            ...vehicle.copy[brochureLanguage].specs,
            [key]: value,
          },
        },
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

  function replacePromotionImage(imageId, src) {
    setPromotionBrochure(current => ({
      ...current,
      vehicles: current.vehicles.map(vehicle => (
        vehicle.image.id === imageId
          ? { ...vehicle, image: { ...vehicle.image, src } }
          : vehicle
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
        scale: 4,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        logging: false,
        windowWidth: brochureRef.current.scrollWidth,
        windowHeight: brochureRef.current.scrollHeight,
      });

      const pdfHeight = templateId === "promotionList" ? 474 : 297;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [210, pdfHeight],
        compress: true,
      });
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      pdf.addImage(imageData, "JPEG", 0, 0, 210, pdfHeight, undefined, "MEDIUM");
      const fileName = templateId === "promotionList"
        ? "Carloha-Promotion-List-Dealer-Brochure.pdf"
        : `${currentVehicle.label || selectedVehicleId}-${brochureLanguage}-Dealer-Brochure.pdf`;

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
          <label htmlFor="brochureTemplate">Template</label>
          <select
            id="brochureTemplate"
            value={templateId}
            onChange={event => setTemplateId(event.target.value)}
          >
            <option value="singleVehicle">Single Vehicle</option>
            <option value="promotionList">Promotion List</option>
          </select>
        </div>

        {templateId === "singleVehicle" ? (
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
        ) : null}

        {templateId === "singleVehicle" ? (
        <div className={styles.languageToggle} aria-label="Brochure language">
          <button
            className={brochureLanguage === "CN" ? styles.activeLanguage : ""}
            type="button"
            onClick={() => setBrochureLanguage("CN")}
            aria-pressed={brochureLanguage === "CN"}
          >
            中文
          </button>
          <button
            className={brochureLanguage === "EN" ? styles.activeLanguage : ""}
            type="button"
            onClick={() => setBrochureLanguage("EN")}
            aria-pressed={brochureLanguage === "EN"}
          >
            EN
          </button>
        </div>
        ) : null}

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
          className={`${styles.pageShell} ${templateId === "promotionList" ? styles.promotionPageShell : ""} ${isExporting ? styles.exportingShell : ""}`}
        >
          <div ref={brochureRef} className={isExporting ? styles.exporting : ""}>
            {templateId === "promotionList" ? (
              <PromotionTemplate
                brochure={promotionBrochure}
                onUpdate={setPromotionBrochure}
                onReplaceImage={replacePromotionImage}
              />
            ) : (
              <article className={`${styles.a4Page} ${brochureLanguage === "EN" ? styles.englishBrochure : ""}`}>
                <div className={styles.topAccent} />
                <div className={styles.bottomAccent} />

                <header className={styles.header}>
                  <EditableText value={currentCopy.title} className={styles.title} multiline onChange={updateTitle} />
                  <img className={styles.logo} src={currentVehicle.logo} alt="Chery Carloha logo" />
                </header>

                <section className={styles.heroRow}>
                  <div className={styles.specCard}>
                    {visibleSpecRows.map(row => (
                      <div className={styles.specRow} key={row.key}>
                        <span className={styles.specMarker}>{getSpecMarker(row, currentCopy.specs)}</span>
                        <div className={styles.specCopy}>
                          <span className={styles.specLabel}>{row.label[brochureLanguage]}{brochureLanguage === "CN" ? "：" : ": "}</span>
                          <EditableText
                            value={currentCopy.specs[row.key]}
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
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
