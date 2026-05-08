import { useRef, useCallback } from 'react';

export function useCanvas() {
  const canvasRef = useRef(null);

  const redraw = useCallback((image, textLayers) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    textLayers.forEach((layer) => {
      const fontSize = layer.size;
      ctx.font = `900 ${fontSize}px ${layer.font}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const x = canvas.width / 2;
      const y = canvas.height * (layer.y / 100);

      // Word wrap
      const words = layer.text.split(' ');
      const maxWidth = canvas.width * 0.9;
      const lines = [];
      let current = '';

      words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      });
      if (current) lines.push(current);

      lines.forEach((line, i) => {
        const lineY = y + i * (fontSize * 1.2);
        if (layer.stroke !== 'none') {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = Math.max(2, fontSize / 9);
          ctx.lineJoin = 'round';
          ctx.strokeText(line, x, lineY);
        }
        ctx.fillStyle = layer.color;
        ctx.fillText(line, x, lineY);
      });
    });
  }, []);

  const getHighResDataUrl = useCallback((image, textLayers) => {
    if (!image) return null;
    const tmp = document.createElement('canvas');
    tmp.width = image.naturalWidth || image.width;
    tmp.height = image.naturalHeight || image.height;
    const ctx = tmp.getContext('2d');
    ctx.drawImage(image, 0, 0, tmp.width, tmp.height);

    const displayCanvas = canvasRef.current;
    const scaleX = tmp.width / (displayCanvas?.width || 1);
    const scaleY = tmp.height / (displayCanvas?.height || 1);

    textLayers.forEach((layer) => {
      const fontSize = layer.size * ((scaleX + scaleY) / 2);
      ctx.font = `900 ${fontSize}px ${layer.font}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const x = tmp.width / 2;
      const y = tmp.height * (layer.y / 100);

      const words = layer.text.split(' ');
      const maxWidth = tmp.width * 0.9;
      const lines = [];
      let current = '';

      words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      });
      if (current) lines.push(current);

      lines.forEach((line, i) => {
        const lineY = y + i * (fontSize * 1.2);
        if (layer.stroke !== 'none') {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = Math.max(3, fontSize / 9);
          ctx.lineJoin = 'round';
          ctx.strokeText(line, x, lineY);
        }
        ctx.fillStyle = layer.color;
        ctx.fillText(line, x, lineY);
      });
    });

    return tmp.toDataURL('image/png');
  }, []);

  const fitCanvasToImage = useCallback((image, containerWidth) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const maxW = containerWidth - 48;
    const maxH = 420;
    const ratio = Math.min(maxW / image.width, maxH / image.height, 1);
    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);
  }, []);

  return { canvasRef, redraw, getHighResDataUrl, fitCanvasToImage };
}
