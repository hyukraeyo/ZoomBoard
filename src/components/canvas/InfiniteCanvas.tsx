'use client';

import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { useRef, useState, useEffect } from 'react';
import { Minus, Plus, Maximize, StickyNote } from 'lucide-react';
import styles from './InfiniteCanvas.module.css';
import { useNoteStore } from '@/store/useNoteStore';
import NoteComponent from '@/components/editor/NoteComponent';

interface CustomZoomRef {
    state: {
        scale: number;
        positionX: number;
        positionY: number;
    };
    instance: {
        wrapperComponent: HTMLElement | null;
    };
}

export default function InfiniteCanvas() {
    const transformComponentRef = useRef<ReactZoomPanPinchContentRef | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Optimize selectors to prevent re-renders when viewport updates
    const notes = useNoteStore(state => state.notes);
    const addNote = useNoteStore(state => state.addNote);
    const fetchNotes = useNoteStore(state => state.fetchNotes);
    const focusedNoteId = useNoteStore(state => state.focusedNoteId);
    const setViewport = useNoteStore(state => state.setViewport);

    const [currentScale, setCurrentScale] = useState(1);
    const [isPlacementMode, setIsPlacementMode] = useState(false);
    const [isPanning, setIsPanning] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleTransformUpdate = (ref: CustomZoomRef) => {
        const { scale, positionX, positionY } = ref.state;
        const wrapper = ref.instance.wrapperComponent;
        if (wrapper) {
            const { width, height } = wrapper.getBoundingClientRect();
            setViewport({ x: positionX, y: positionY, scale, width, height });
            setCurrentScale(scale);
            updateBackground(scale, positionX, positionY);
        }
    };

    useEffect(() => {
        if (!focusedNoteId || !transformComponentRef.current) return;

        const note = notes.find(n => n.id === focusedNoteId);
        if (!note) return;

        // Center visual calculation
        // Note width ~ 650px, Height varies (assume ~200px or top-anchored)
        // We want to center the top-center of the note or the whole note
        const noteCenterX = note.x + 325; // Half of 650
        const noteCenterY = note.y + 150; // Some offset

        const wrapper = transformComponentRef.current.instance.wrapperComponent;
        if (!wrapper) return;
        const { width, height } = wrapper.getBoundingClientRect();

        const targetScale = 1;

        const targetX = (width / 2) - (noteCenterX * targetScale);
        const targetY = (height / 2) - (noteCenterY * targetScale);

        transformComponentRef.current.setTransform(targetX, targetY, targetScale, 1000, "easeOutQuad"); // Smooth animation
    }, [focusedNoteId, notes]);

    const canvasSize = 10000;

    // Handle transforming global mouse coordinates to local canvas coordinates
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPlacementMode) return;

        // Robust check: Ensure we aren't clicking on a note or UI control
        // @ts-expect-error: closest is guaranteed in DOM environment
        if (e.target.closest && (e.target.closest('.note-item') || e.target.closest('button'))) return;

        if (!transformComponentRef.current) return;

        // Correctly access state from the instance
        const wrapper = transformComponentRef.current.instance.wrapperComponent;
        // Try to get state from instance or fallback (some versions differ)
        // @ts-expect-error: access internal state safely
        const transformState = transformComponentRef.current.instance.transformState || transformComponentRef.current.state;

        if (!wrapper || !transformState) return;

        const { positionX, positionY, scale } = transformState;
        const rect = wrapper.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Inverse transform
        const canvasX = (mouseX - positionX) / scale;
        const canvasY = (mouseY - positionY) / scale;

        addNote(canvasX, canvasY);
        setIsPlacementMode(false);
    };



    const updateBackground = (scale: number, x: number, y: number) => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--scale', scale.toString());
            containerRef.current.style.setProperty('--x', x.toString());
            containerRef.current.style.setProperty('--y', y.toString());
        }
    };

    // Initialize background on mount
    useEffect(() => {
        if (transformComponentRef.current) {
            const { scale, positionX, positionY } = transformComponentRef.current.instance.transformState;
            updateBackground(scale, positionX, positionY);
        }
    }, []);

    const handleFitToView = () => {
        if (notes.length === 0 || !transformComponentRef.current) {
            transformComponentRef.current?.resetTransform();
            return;
        }

        // Calculate bounding box of all notes
        const minX = Math.min(...notes.map(n => n.x));
        const maxX = Math.max(...notes.map(n => n.x + 700)); // 700 is note width
        const minY = Math.min(...notes.map(n => n.y));
        const maxY = Math.max(...notes.map(n => n.y + 200)); // approx height

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const centerX = minX + contentWidth / 2;
        const centerY = minY + contentHeight / 2;

        const wrapper = transformComponentRef.current.instance.wrapperComponent;
        if (!wrapper) return;

        const { width: wrapperWidth, height: wrapperHeight } = wrapper.getBoundingClientRect();
        const padding = 100;

        // Calculate scale to fit content within wrapper with padding
        const scaleX = (wrapperWidth - padding * 2) / contentWidth;
        const scaleY = (wrapperHeight - padding * 2) / contentHeight;

        let targetScale = Math.min(scaleX, scaleY);
        targetScale = Math.min(Math.max(targetScale, 0.2), 1.5); // Check within bounds

        // Calculate position to center content
        // Center of viewport (relative to wrapper) should match Center of Content * Scale + Position
        // wrapperW/2 = centerX * s + posX
        // posX = wrapperW/2 - centerX * s

        const targetX = (wrapperWidth / 2) - (centerX * targetScale);
        const targetY = (wrapperHeight / 2) - (centerY * targetScale);

        transformComponentRef.current.setTransform(targetX, targetY, targetScale);
    };

    return (
        <div
            ref={containerRef}
            className={styles.canvasContainer}
            style={{
                cursor: isPlacementMode ? 'crosshair' : (isPanning ? 'grabbing' : 'grab')
            }}
            onClick={handleCanvasClick}
        >
            <TransformWrapper
                ref={transformComponentRef}
                initialScale={1}
                minScale={0.2}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={false}
                wheel={{ step: 0.1, smoothStep: 0.002 }}
                onTransformed={handleTransformUpdate}
                onPanningStart={() => setIsPanning(true)}
                onPanningStop={() => setIsPanning(false)}
                onInit={(ref) => {
                    setTimeout(() => ref.centerView(1, 0), 50);
                    handleTransformUpdate(ref);
                }}
                doubleClick={{ disabled: true }}
                disabled={isPlacementMode} // Disable pan/zoom when placing a note
                panning={{ excluded: ['react-draggable', 'drag-handle-class'] }} // Prevent panning when dragging items
            >
                {({ zoomIn, zoomOut }) => (
                    <>
                        {/* Controls ... */}
                        <div className={styles.controls}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsPlacementMode(!isPlacementMode); }}
                                className={`${styles.button} ${isPlacementMode ? styles.active : ''}`}
                                aria-label="Add Note"
                                title="Click to place a new note"
                                style={{ color: isPlacementMode ? 'var(--accent-primary)' : undefined }}
                            >
                                <StickyNote size={20} strokeWidth={1.5} />
                            </button>

                            <div style={{ width: 1, height: 20, background: 'var(--border-secondary)', margin: '0 4px' }} />

                            <button
                                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                                className={styles.button}
                                disabled={currentScale <= 0.2}
                                style={{ opacity: currentScale <= 0.2 ? 0.3 : 1, cursor: currentScale <= 0.2 ? 'not-allowed' : 'pointer' }}
                            >
                                <Minus size={20} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleFitToView(); }}
                                className={styles.button}
                                title="Fit All Notes"
                            >
                                <Maximize size={20} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                                className={styles.button}
                                disabled={currentScale >= 4}
                                style={{ opacity: currentScale >= 4 ? 0.3 : 1, cursor: currentScale >= 4 ? 'not-allowed' : 'pointer' }}
                            >
                                <Plus size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentStyle={{ width: "100%", height: "100%" }}
                        >
                            <div
                                className={styles.canvasContent}
                                style={{
                                    width: `${canvasSize}px`,
                                    height: `${canvasSize}px`,
                                    position: 'relative', // Relative for absolute children
                                }}
                            >
                                {notes.map((note) => (
                                    <NoteComponent
                                        key={note.id}
                                        note={note}
                                        scale={currentScale}
                                    />
                                ))}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>

            {isPlacementMode && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-primary)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    pointerEvents: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                }}>
                    Click anywhere to place note
                </div>
            )}
        </div>
    );
}
