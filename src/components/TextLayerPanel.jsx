import React from 'react';
import { FONT_OPTIONS, STROKE_OPTIONS, COLOR_PALETTE, createDefaultLayer } from '../utils/memeUtils';
import styles from './TextLayerPanel.module.css';

export default function TextLayerPanel({ layers, activeIdx, setActiveIdx, setLayers, hasImage }) {

  const addLayer = () => {
    if (!hasImage) return;
    const newLayer = createDefaultLayer(layers.length);
    setLayers((prev) => {
      const next = [...prev, newLayer];
      setActiveIdx(next.length - 1);
      return next;
    });
  };

  const removeLayer = (idx) => {
    setLayers((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveIdx(Math.max(0, idx - 1));
      return next;
    });
    if (layers.length <= 1) setActiveIdx(-1);
  };

  const updateActive = (field, value) => {
    setLayers((prev) =>
      prev.map((l, i) => (i === activeIdx ? { ...l, [field]: value } : l))
    );
  };

  const active = layers[activeIdx] || null;

  return (
    <div className={styles.panel}>
      {/* Layer list */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Couches de texte</span>
          <button
            className={styles.addBtn}
            onClick={addLayer}
            disabled={!hasImage}
            title="Ajouter une couche"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter
          </button>
        </div>

        {layers.length === 0 && (
          <p className={styles.empty}>
            {hasImage ? 'Aucun texte — cliquez sur Ajouter.' : 'Chargez une image d\'abord.'}
          </p>
        )}

        <div className={styles.layerList}>
          {layers.map((l, i) => (
            <div
              key={l.id}
              className={`${styles.layerItem} ${i === activeIdx ? styles.active : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <div className={styles.layerDot} style={{ background: l.color, border: l.color === '#000000' ? '1px solid #555' : 'none' }} />
              <span className={styles.layerLabel}>{l.text || '(vide)'}</span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); removeLayer(i); }}
                title="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {active && (
        <div className={styles.section} key={activeIdx}>
          <div className={styles.sectionTitle} style={{ marginBottom: 14 }}>Style du texte</div>

          <div className={styles.field}>
            <label className={styles.label}>Contenu</label>
            <input
              className={styles.input}
              type="text"
              value={active.text}
              onChange={(e) => updateActive('text', e.target.value)}
              placeholder="Votre texte ici..."
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Position verticale — {active.y}%</label>
            <input
              className={styles.range}
              type="range" min="2" max="95" value={active.y}
              onChange={(e) => updateActive('y', Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Taille — {active.size}px</label>
            <input
              className={styles.range}
              type="range" min="12" max="90" value={active.size}
              onChange={(e) => updateActive('size', Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Couleur</label>
            <div className={styles.colorGrid}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  className={`${styles.colorDot} ${active.color === c ? styles.colorActive : ''}`}
                  style={{ background: c, border: c === '#FFFFFF' ? '1px solid #444' : 'none' }}
                  onClick={() => updateActive('color', c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Police</label>
              <select
                className={styles.select}
                value={active.font}
                onChange={(e) => updateActive('font', e.target.value)}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field} style={{ flex: 1 }}>
              <label className={styles.label}>Contour</label>
              <select
                className={styles.select}
                value={active.stroke}
                onChange={(e) => updateActive('stroke', e.target.value)}
              >
                {STROKE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
