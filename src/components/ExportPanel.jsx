import React, { useState } from 'react';
import { downloadDataUrl, copyImageToClipboard } from '../utils/memeUtils';
import styles from './ExportPanel.module.css';

// clé ImgBB obtenue sur https://api.imgbb.com
const IMGBB_API_KEY = '87d3e6bb56eba45a27b1ca602d3fae2f';

// Compresse l'image en JPEG < 5MB avant upload
function compressDataUrl(dataUrl, maxSizeKB = 4000, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Redimensionne si trop grande (max 1920px)
      const MAX = 1920;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      // Compresse avec qualité décroissante jusqu'à passer sous maxSizeKB
      let q = quality;
      let result = canvas.toDataURL('image/jpeg', q);
      while (result.length * 0.75 > maxSizeKB * 1024 && q > 0.3) {
        q -= 0.1;
        result = canvas.toDataURL('image/jpeg', q);
      }
      resolve(result);
    };
    img.src = dataUrl;
  });
}

async function uploadToImgBB(dataUrl) {
  // Compresse avant upload
  const compressed = await compressDataUrl(dataUrl);
  const base64 = compressed.split(',')[1];

  const form = new FormData();
  form.append('image', base64);
  form.append('key', IMGBB_API_KEY);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: form,
  });

  // Log la réponse brute pour debug
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Réponse invalide: ${text.slice(0, 100)}`); }

  if (!response.ok || !data.success) {
    const msg = data?.error?.message || data?.status_txt || `Erreur ${response.status}`;
    throw new Error(`ImgBB: ${msg}`);
  }
  return data.data.url;
}

export default function ExportPanel({ getHighResDataUrl, image, textLayers, onSave }) {
  const [copying, setCopying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(null);
  const [publicUrl, setPublicUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const getOrUpload = async () => {
    if (publicUrl) return publicUrl;
    const dataUrl = getHighResDataUrl(image, textLayers);
    if (!dataUrl) throw new Error("Pas d'image à uploader");
    if (IMGBB_API_KEY === 'dd04ab928f0a12135e90c087bde74850') {
      throw new Error('Clé ImgBB manquante — https://api.imgbb.com');
    }
    const url = await uploadToImgBB(dataUrl);
    setPublicUrl(url);
    return url;
  };

  const handleDownload = () => {
    const url = getHighResDataUrl(image, textLayers);
    if (url) downloadDataUrl(url, `meme-${Date.now()}.png`);
  };

  const handleCopy = async () => {
    const url = getHighResDataUrl(image, textLayers);
    if (!url) return;
    setCopying(true);
    try {
      await copyImageToClipboard(url);
    } catch {
      alert("Votre navigateur ne supporte pas la copie d'image.");
    } finally {
      setCopying(false);
    }
  };

  const handleSave = () => {
    const url = getHighResDataUrl(image, textLayers);
    if (!url) return;
    onSave(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = async (network) => {
    setSharing(network);
    setUploadError(null);
    try {
      const url = await getOrUpload();
      const text = encodeURIComponent("Regardez ce mème que j'ai créé avec Mème4You ");
      const encodedUrl = encodeURIComponent(url);
      const links = {
        twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      };
      window.open(links[network], '_blank', 'noopener,noreferrer');
    } catch (err) {
      setUploadError(err.message || 'Erreur inconnue');
    } finally {
      setSharing(null);
    }
  };

  React.useEffect(() => {
    setPublicUrl(null);
    setUploadError(null);
  }, [image, textLayers]);

  const disabled = !image;
  const noKey = IMGBB_API_KEY === 'dd04ab928f0a12135e90c087bde74850';

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Enregistrer & Exporter</div>
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave} disabled={disabled}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {saved ? 'Enregistré ✓' : 'Enregistrer dans la galerie'}
        </button>
        <button className={`${styles.btn} ${styles.secondary}`} onClick={handleDownload} disabled={disabled}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger en PNG
        </button>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={handleCopy} disabled={disabled || copying}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copying ? 'Copié !' : "Copier l'image"}
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Partager</div>

        {noKey ? (
          <div className={styles.keyWarning}>
            ⚠️ Ajoutez votre clé ImgBB dans <code>ExportPanel.jsx</code> pour activer le partage.{' '}
            <a href="https://api.imgbb.com" target="_blank" rel="noreferrer" className={styles.keyLink}>
              Obtenir une clé →
            </a>
          </div>
        ) : (
          <p className={styles.shareHint}>
            L'image sera compressée puis uploadée sur ImgBB.
          </p>
        )}

        <div className={styles.shareGrid}>
          <button
            className={`${styles.shareBtn} ${styles.twitter}`}
            onClick={() => handleShare('twitter')}
            disabled={disabled || sharing === 'twitter' || noKey}
          >
            {sharing === 'twitter'
              ? <span className={styles.spinner} />
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            }
            Twitter / X
          </button>

          <button
            className={`${styles.shareBtn} ${styles.facebook}`}
            onClick={() => handleShare('facebook')}
            disabled={disabled || sharing === 'facebook' || noKey}
          >
            {sharing === 'facebook'
              ? <span className={styles.spinner} />
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            }
            Facebook
          </button>

          <button
            className={`${styles.shareBtn} ${styles.whatsapp}`}
            onClick={() => handleShare('whatsapp')}
            disabled={disabled || sharing === 'whatsapp' || noKey}
            style={{ gridColumn: 'span 2' }}
          >
            {sharing === 'whatsapp'
              ? <span className={styles.spinner} />
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            }
            WhatsApp
          </button>
        </div>

        {uploadError && (
          <div className={styles.errorBox}>❌ {uploadError}</div>
        )}

        {publicUrl && (
          <div className={styles.linkBox}>
            <span className={styles.linkLabel}>🔗 Lien public :</span>
            <a href={publicUrl} target="_blank" rel="noreferrer" className={styles.linkUrl}>
              {publicUrl.replace('https://', '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
