"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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

const promotionLabels = {
  specsTitle: { CN: "车辆亮点", EN: "SPECIFICATIONS" },
  price: { CN: "原价", EN: "PRICE" },
  promoPrice: { CN: "促销 / 预订价", EN: "PROMO / PRE ORDER" },
};

function getLocalizedValue(value, language) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? value.EN ?? value.CN ?? "";
  }

  return value ?? "";
}

function setLocalizedValue(value, language, nextValue) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...value, [language]: nextValue };
  }

  return { EN: value ?? "", CN: value ?? "", [language]: nextValue };
}

function cloneLocalizedValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...value };
  }

  return value;
}

function getSpecMarker(row, specs) {
  if (row.key === "tireSize") {
    const sizeMatch = specs.tireSize.match(/R\s*\d+/i);
    if (sizeMatch) return sizeMatch[0].replace(/\s+/g, "").toUpperCase();

    const inchMatch = specs.tireSize.match(/(\d{2})\s*(?:-?\s*inch|英寸)/i);
    return inchMatch ? `${inchMatch[1]}IN` : row.marker;
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
    heading: cloneLocalizedValue(brochure.heading),
    subheading: cloneLocalizedValue(brochure.subheading),
    footerNotes: brochure.footerNotes.map(note => cloneLocalizedValue(note)),
    contactLabel: cloneLocalizedValue(brochure.contactLabel),
    contactValue: cloneLocalizedValue(brochure.contactValue),
    locations: cloneLocalizedValue(brochure.locations),
    website: cloneLocalizedValue(brochure.website),
    vehicles: brochure.vehicles.map(vehicle => ({
      ...vehicle,
      name: cloneLocalizedValue(vehicle.name),
      specs: cloneLocalizedValue(vehicle.specs),
      price: cloneLocalizedValue(vehicle.price),
      promoPrice: cloneLocalizedValue(vehicle.promoPrice),
      image: { ...vehicle.image },
      brandLogo: vehicle.brandLogo ? { ...vehicle.brandLogo } : undefined,
    })),
  };
}

function EditableText({ value, className, onChange, multiline = false, ariaLabel = "Editable brochure text" }) {
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
      aria-label={ariaLabel}
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
  overlayLogo,
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
  imageShiftY = 0,
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

    let baseStyle;

    if (fit === "contain") {
      baseStyle = imageAspect > slotAspect
        ? { width: "100%", height: "auto" }
        : { width: "auto", height: "100%" };
    } else {
      baseStyle = imageAspect > slotAspect
        ? { width: "auto", height: "100%" }
        : { width: "100%", height: "auto" };
    }

    if (imageShiftY !== 0) {
      const yPercent = -50 - imageShiftY * 100;
      const scale = 1 + imageShiftY * 2.2;
      return { ...baseStyle, transform: `translate(-50%, ${yPercent}%) scale(${scale})` };
    }

    return baseStyle;
  }, [fit, imageSize, slotSize, imageShiftY]);

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
      {overlayLogo ? (
        <img
          className={styles.promoImageLogo}
          src={overlayLogo.src}
          alt={overlayLogo.alt}
          draggable={false}
        />
      ) : null}
      {draggable ? <span className={styles.dragHint}>Drag</span> : null}
      <button
        className={styles.replaceButton}
        type="button"
        aria-label={`Replace ${image.label} image`}
        onClick={() => inputRef.current?.click()}
      >
        Replace
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

function PromotionTemplate({ brochure, language, onUpdate, onReplaceImage }) {
  function updateField(key, value) {
    onUpdate(current => ({ ...current, [key]: setLocalizedValue(current[key], language, value) }));
  }

  function updateVehicle(vehicleId, key, value) {
    onUpdate(current => ({
      ...current,
      vehicles: current.vehicles.map(vehicle => (
        vehicle.id === vehicleId ? { ...vehicle, [key]: setLocalizedValue(vehicle[key], language, value) } : vehicle
      )),
    }));
  }

  function updateFooterNote(index, value) {
    onUpdate(current => ({
      ...current,
      footerNotes: current.footerNotes.map((note, noteIndex) => (
        noteIndex === index ? setLocalizedValue(note, language, value) : note
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
        <EditableText value={getLocalizedValue(brochure.subheading, language)} ariaLabel="Promotion list subheading" className={styles.promotionSubheading} onChange={value => updateField("subheading", value)} />
        <EditableText value={getLocalizedValue(brochure.heading, language)} ariaLabel="Promotion list heading" className={styles.promotionHeading} onChange={value => updateField("heading", value)} />
      </header>

      <section className={styles.promotionVehicleList}>
        {brochure.vehicles.map((vehicle, index) => (
          <article className={styles.promotionVehicle} key={vehicle.id}>
            <div className={styles.promotionVisual}>
              <span className={styles.promotionVehicleNumber}>{String(index + 1).padStart(2, "0")}</span>
              <EditableText value={getLocalizedValue(vehicle.name, language)} ariaLabel={`${vehicle.image.label} model name`} className={styles.promotionVehicleName} onChange={value => updateVehicle(vehicle.id, "name", value)} />
              <ImageSlot image={vehicle.image} overlayLogo={vehicle.brandLogo} className={styles.promotionVehicleImage} onReplace={onReplaceImage} draggable={false} fit="contain" />
            </div>
            <div className={styles.promotionDetails}>
              <strong className={styles.promotionSpecsTitle}>{promotionLabels.specsTitle[language]}</strong>
              <EditableText value={getLocalizedValue(vehicle.specs, language)} ariaLabel={`${vehicle.image.label} specification`} className={styles.promotionSpecs} multiline onChange={value => updateVehicle(vehicle.id, "specs", value)} />
              <div className={styles.promotionPrices}>
                <div>
                  <span>{promotionLabels.price[language]}</span>
                  <EditableText value={getLocalizedValue(vehicle.price, language)} ariaLabel={`${vehicle.image.label} price`} className={styles.promotionPrice} onChange={value => updateVehicle(vehicle.id, "price", value)} />
                </div>
                <div>
                  <span>{promotionLabels.promoPrice[language]}</span>
                  <EditableText value={getLocalizedValue(vehicle.promoPrice, language)} ariaLabel={`${vehicle.image.label} promotional price`} className={styles.promotionPromoPrice} onChange={value => updateVehicle(vehicle.id, "promoPrice", value)} />
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
              <li key={index}><EditableText value={getLocalizedValue(note, language)} ariaLabel={`Promotion list footer note ${index + 1}`} onChange={value => updateFooterNote(index, value)} /></li>
            ))}
          </ul>
          <div className={styles.promotionContact}>
            <EditableText value={getLocalizedValue(brochure.contactLabel, language)} ariaLabel="Promotion list contact label" className={styles.promotionContactLabel} onChange={value => updateField("contactLabel", value)} />
            <EditableText value={getLocalizedValue(brochure.contactValue, language)} ariaLabel="Promotion list contact value" className={styles.promotionContactValue} onChange={value => updateField("contactValue", value)} />
          </div>
        </div>
        <div className={styles.promotionLocations}>
          <EditableText value={getLocalizedValue(brochure.locations, language)} ariaLabel="Promotion list locations" multiline onChange={value => updateField("locations", value)} />
          <EditableText value={getLocalizedValue(brochure.website, language)} ariaLabel="Promotion list website" className={styles.promotionWebsite} onChange={value => updateField("website", value)} />
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
  const isSingleVehicle = templateId === "singleVehicle";
  const templateLabel = isSingleVehicle ? "Standard Brochure" : "Promotion List";
  const languageLabel = brochureLanguage === "CN" ? "中文" : "English";
  const activeCanvasLabel = isSingleVehicle
    ? `${currentVehicle.label} · ${languageLabel}`
    : `${templateLabel} · ${languageLabel}`;

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
      <header className={styles.appBar}>
        <div className={styles.appBarCopy}>
          <Link className={styles.backLink} href="/">
            <span aria-hidden="true">←</span>
            Back to Marketing Hub
          </Link>
          <div>
            <p className={styles.productLabel}>Carloha Marketing Hub</p>
            <h1>Chinese Dealer Brochure</h1>
            <p>Customize text and images, then export a ready-to-share PDF.</p>
          </div>
        </div>
        <button className={styles.downloadButton} type="button" onClick={downloadPdf} disabled={isExporting}>
          {isExporting ? "Preparing PDF..." : "Download PDF"}
        </button>
      </header>

      <ol className={styles.steps} aria-label={brochureLanguage === "CN" ? "制作步骤" : "Creation steps"}>
        {(brochureLanguage === "CN"
          ? ["选择模板", "编辑文字和图片", "下载 PDF"]
          : ["Select template", "Edit text and images", "Download PDF"]
        ).map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>

      {pendingPdfShare ? (
        <div className={styles.savePrompt} role="status">
          <span>{pendingPdfShare.fileName}</span>
          <button type="button" onClick={sharePendingPdf}>Save PDF</button>
          <button type="button" onClick={() => setPendingPdfShare(null)}>Cancel</button>
        </div>
      ) : null}

      <div className={styles.workspace}>
        <aside className={styles.settingsPanel} aria-labelledby="brochureSettingsTitle">
          <div className={styles.settingsHeader}>
            <p className={styles.panelEyebrow}>{brochureLanguage === "CN" ? "宣传单设置" : "Brochure setup"}</p>
            <h2 id="brochureSettingsTitle">Settings</h2>
            <p className={styles.settingsIntro}>
              {brochureLanguage === "CN"
                ? "先选择宣传单格式，再直接编辑右侧画布。"
                : "Choose the brochure format, then edit directly on the canvas."}
            </p>
          </div>

          <section className={styles.settingsSection} aria-labelledby="brochureBasicsTitle">
            <div className={styles.sectionHeading}>
              <div>
                <h3 id="brochureBasicsTitle">{brochureLanguage === "CN" ? "基础设置" : "Basics"}</h3>
                <p>{brochureLanguage === "CN" ? "选择模板、车型与语言。" : "Select the template, model and language."}</p>
              </div>
              <span aria-hidden="true">01</span>
            </div>

            <div className={styles.settingsFields}>
              <div className={styles.controlGroup}>
                <label htmlFor="brochureTemplate">Template</label>
                <select
                  id="brochureTemplate"
                  value={templateId}
                  onChange={event => setTemplateId(event.target.value)}
                >
                  <option value="singleVehicle">Standard Brochure</option>
                  <option value="promotionList">Promotion List</option>
                </select>
              </div>

              {isSingleVehicle ? (
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

              <div className={styles.languageField}>
                <span className={styles.controlLabel}>Language</span>
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
              </div>
            </div>
          </section>

          <section className={`${styles.settingsSection} ${styles.editSection}`} aria-labelledby="brochureEditTitle">
            <div className={styles.sectionHeading}>
              <div>
                <h3 id="brochureEditTitle">{brochureLanguage === "CN" ? "编辑内容" : "Edit content"}</h3>
                <p>{brochureLanguage === "CN" ? "所有修改都在预览画布中完成。" : "Make all content changes directly on the preview."}</p>
              </div>
              <span aria-hidden="true">02</span>
            </div>

            <div className={styles.activeCanvas} aria-live="polite">
              <span className={styles.statusDot} aria-hidden="true" />
              <div>
                <small>{brochureLanguage === "CN" ? "当前画布" : "Active canvas"}</small>
                <strong>{activeCanvasLabel}</strong>
                <span>{templateLabel}</span>
              </div>
            </div>

            <div className={styles.editModes}>
              <div className={styles.editMode}>
                <span aria-hidden="true">Aa</span>
                <div>
                  <strong>{brochureLanguage === "CN" ? "文字" : "Text"}</strong>
                  <small>{brochureLanguage === "CN" ? "点击画布中的文字直接编辑" : "Click text on the canvas to edit"}</small>
                </div>
              </div>
              <div className={styles.editMode}>
                <span aria-hidden="true">IMG</span>
                <div>
                  <strong>{brochureLanguage === "CN" ? "图片" : "Images"}</strong>
                  <small>{brochureLanguage === "CN" ? "替换图片或拖动调整顺序" : "Replace images or drag to reorder"}</small>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.instructions} aria-labelledby="brochureInstructionsTitle">
            <div className={styles.instructionsHeading}>
              <h3 id="brochureInstructionsTitle">{brochureLanguage === "CN" ? "使用说明" : "Instructions"}</h3>
              <span>{brochureLanguage === "CN" ? "辅助" : "Help"}</span>
            </div>
            <ul>
              {(brochureLanguage === "CN"
                ? ["点击文字直接编辑", "拖动图片调整顺序", "点击“替换图片”上传自己的图片", "刷新页面即可恢复默认内容"]
                : ["Click text to edit", "Drag images to reorder", "Use Replace Image to upload your own image", "Refresh the page to restore the default content"]
              ).map(instruction => <li key={instruction}>{instruction}</li>)}
            </ul>
          </section>
        </aside>

        <section className={styles.previewPanel} aria-labelledby="brochurePreviewTitle">
          <div className={styles.previewHeader}>
            <div>
              <p className={styles.panelEyebrow}>{brochureLanguage === "CN" ? "画布工作区" : "Canvas workspace"}</p>
              <h2 id="brochurePreviewTitle">Preview</h2>
              <p className={styles.previewDescription}>
                {brochureLanguage === "CN" ? "点击文字或图片开始编辑。" : "Click any text or image to start editing."}
              </p>
            </div>
            <div className={styles.previewMeta}>
              <span className={styles.editingBadge}>
                <i aria-hidden="true" />
                {brochureLanguage === "CN" ? `正在编辑 ${isSingleVehicle ? currentVehicle.label : "Promotion List"}` : `Editing ${isSingleVehicle ? currentVehicle.label : "Promotion List"}`}
              </span>
              <span className={styles.dimensionBadge}>{templateId === "promotionList" ? "210 × 474 mm" : "A4 · 210 × 297 mm"}</span>
            </div>
          </div>

          <div className={styles.previewRail} aria-label={`${templateLabel} preview canvas`}>
            <div
              className={`${styles.pageShell} ${templateId === "promotionList" ? styles.promotionPageShell : ""} ${isExporting ? styles.exportingShell : ""}`}
            >
              <div ref={brochureRef} className={isExporting ? styles.exporting : ""}>
                {templateId === "promotionList" ? (
                  <PromotionTemplate
                    brochure={promotionBrochure}
                    language={brochureLanguage}
                    onUpdate={setPromotionBrochure}
                    onReplaceImage={replacePromotionImage}
                  />
                ) : (
                  <article className={`${styles.a4Page} ${brochureLanguage === "EN" ? styles.englishBrochure : ""}`}>
                <div className={styles.topAccent} />
                <div className={styles.bottomAccent} />

                <header className={styles.header}>
                  <EditableText value={currentCopy.title} ariaLabel="Brochure title" className={`${styles.title} ${selectedVehicleId !== "tiggo9" ? styles.compactTitle : ""}`} multiline onChange={updateTitle} />
                  <img className={styles.logo} src={currentVehicle.logo} alt="Chery Carloha logo" />
                </header>

                {selectedVehicleId !== "himla" ? (
                  <div className={styles.warrantyTagline}>
                    {brochureLanguage === "CN" ? (
                      <><span className={styles.warrantyHighlight}>6</span>年质保  ·  <span className={styles.warrantyHighlight}>6</span>年免费保养  ·  <span className={styles.warrantyHighlight}>7</span>天维修承诺</>
                    ) : (
                      <><span className={styles.warrantyHighlight}>6</span>-year warranty  ·  <span className={styles.warrantyHighlight}>6</span>-year free service  ·  <span className={styles.warrantyHighlight}>7</span>-day repair promise</>
                    )}
                  </div>
                ) : null}

                <section className={styles.heroRow}>
                  <div className={styles.specCard}>
                    {visibleSpecRows.map(row => (
                      <div className={styles.specRow} key={row.key}>
                        <span className={styles.specMarker}>{getSpecMarker(row, currentCopy.specs)}</span>
                        <div className={styles.specCopy}>
                          <span className={styles.specLabel}>{row.label[brochureLanguage]}{brochureLanguage === "CN" ? "：" : ": "}</span>
                          <EditableText
                            value={currentCopy.specs[row.key]}
                            ariaLabel={`${row.label[brochureLanguage]} value`}
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
                    imageShiftY={heroImage.shiftY ?? 0}
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
                        imageShiftY={image.shiftY ?? 0}
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
          </div>
        </section>
      </div>
    </main>
  );
}
