import React, { useState } from 'react';
import { downloadDataUrl, formatDate } from '../utils/memeUtils';
import styles from './Gallery.module.css';

export default function Gallery({ gallery, onRemove, onClear }) {
  const [preview, setPreview] = useState(null);

  if (gallery.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>Galerie vide</p>
        <p className={styles.emptySub}>Créez un mème et enregistrez-le pour le retrouver ici.</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.header}>
        <span className={styles.count}>{gallery.length} mème{gallery.length > 1 ? 's' : ''}</span>
        <button className={styles.clearBtn} onClick={onClear}>Tout supprimer</button>
      </div>

      <div className={styles.grid}>
        {gallery.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imgWrap} onClick={() => setPreview(item)}>
              <img src={item.url} alt={item.name} className={styles.img} />
              <div className={styles.overlay}>
                <span className={styles.viewLabel}>Voir</span>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>{item.name}</span>
                <span className={styles.cardDate}>{formatDate(item.createdAt)}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.iconBtn}
                  title="Télécharger"
                  onClick={() => downloadDataUrl(item.url, `${item.name.replace(/ /g,'_')}.png`)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.danger}`}
                  title="Supprimer"
                  onClick={() => onRemove(item.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {preview && (
        <div className={styles.lightbox} onClick={() => setPreview(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setPreview(null)}>×</button>
            <img src={preview.url} alt={preview.name} className={styles.lightboxImg} />
            <div className={styles.lightboxFooter}>
              <span className={styles.lightboxName}>{preview.name}</span>
              <button
                className={styles.downloadBtn}
                onClick={() => downloadDataUrl(preview.url, `${preview.name.replace(/ /g,'_')}.png`)}
              >
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
