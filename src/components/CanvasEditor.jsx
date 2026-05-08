import React, { useEffect, useRef } from 'react';
import DropZone from './DropZone';
import styles from './CanvasEditor.module.css';

export default function CanvasEditor({ image, textLayers, canvasRef, redraw, fitCanvasToImage, onImageLoad }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (image && wrapRef.current) {
      fitCanvasToImage(image, wrapRef.current.clientWidth);
      redraw(image, textLayers);
    }
  }, [image, textLayers, redraw, fitCanvasToImage]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {!image ? (
        <DropZone onImageLoad={onImageLoad} />
      ) : (
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
      )}
    </div>
  );
}
