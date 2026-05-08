import React, { useState, useRef, useCallback } from 'react';
import CanvasEditor from './components/CanvasEditor';
import TextLayerPanel from './components/TextLayerPanel';
import ExportPanel from './components/ExportPanel';
import Gallery from './components/Gallery';
import { useCanvas } from './hooks/useCanvas';
import { useGallery } from './hooks/useGallery';
import { readFileAsDataUrl, loadImageFromSrc } from './utils/memeUtils';
import './styles/global.css';
import styles from './App.module.css';

const TABS = ['Éditeur', 'Galerie'];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [image, setImage] = useState(null);       // HTMLImageElement
  const [textLayers, setTextLayers] = useState([]);
  const [activeLayerIdx, setActiveLayerIdx] = useState(-1);
  const [memeCount, setMemeCount] = useState(1);

  const { canvasRef, redraw, getHighResDataUrl, fitCanvasToImage } = useCanvas();
  const { gallery, addToGallery, removeFromGallery, clearGallery } = useGallery();

  const fileInputRef = useRef(null);

  const handleImageLoad = useCallback(async (file) => {
    const src = await readFileAsDataUrl(file);
    const img = await loadImageFromSrc(src);
    setImage(img);
    setTextLayers([]);
    setActiveLayerIdx(-1);
  }, []);

  const handleSave = useCallback((dataUrl) => {
    addToGallery(dataUrl, `Mème #${memeCount}`);
    setMemeCount((n) => n + 1);
  }, [addToGallery, memeCount]);

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Mème4You</span>
        </div>
        <nav className={styles.tabs}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === i ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
              {i === 1 && gallery.length > 0 && (
                <span className={styles.badge}>{gallery.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className={styles.headerRight}>
          {image && (
            <button className={styles.changeBtn} onClick={() => fileInputRef.current?.click()}>
              Changer l'image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleImageLoad(e.target.files[0])}
          />
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === 0 && (
          <div className={styles.editorLayout}>
            {/* Left: Canvas */}
            <div className={styles.canvasCol}>
              <CanvasEditor
                image={image}
                textLayers={textLayers}
                canvasRef={canvasRef}
                redraw={redraw}
                fitCanvasToImage={fitCanvasToImage}
                onImageLoad={handleImageLoad}
              />
            </div>

            {/* Right: Controls */}
            <aside className={styles.sidebar}>
              <TextLayerPanel
                layers={textLayers}
                activeIdx={activeLayerIdx}
                setActiveIdx={setActiveLayerIdx}
                setLayers={setTextLayers}
                hasImage={!!image}
              />
              <ExportPanel
                image={image}
                textLayers={textLayers}
                getHighResDataUrl={getHighResDataUrl}
                onSave={handleSave}
              />
            </aside>
          </div>
        )}

        {activeTab === 1 && (
          <Gallery
            gallery={gallery}
            onRemove={removeFromGallery}
            onClear={clearGallery}
          />
        )}
      </main>
    </div>
  );
}
