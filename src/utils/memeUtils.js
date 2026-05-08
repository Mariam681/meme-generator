export const FONT_OPTIONS = [
  { value: 'Impact', label: 'Impact (classique)' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Comic Sans MS', label: 'Comic Sans' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
];

export const STROKE_OPTIONS = [
  { value: 'black', label: 'Noir' },
  { value: 'white', label: 'Blanc' },
  { value: '#f5c842', label: 'Jaune' },
  { value: 'none', label: 'Aucun' },
];

export const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#f5c842', '#FF4444',
  '#44AAFF', '#44FF88', '#FF6B00', '#FF69B4',
  '#AA44FF', '#00DDCC',
];

export function createDefaultLayer(index = 0) {
  return {
    id: Date.now().toString() + Math.random(),
    text: index === 0 ? 'TEXTE DU HAUT' : 'TEXTE DU BAS',
    y: index === 0 ? 5 : 82,
    size: 42,
    color: '#FFFFFF',
    font: 'Impact',
    stroke: 'black',
  };
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function copyImageToClipboard(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ]);
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
