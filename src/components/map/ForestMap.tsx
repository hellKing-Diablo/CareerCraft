/**
 * FOREST MAP COMPONENT
 *
 * Game-like world map with auto-fit and smart navigation:
 * - AUTO-FIT: Entire flowchart fits on screen by default
 * - HOVER MODE: Pan/zoom enabled when interacting
 * - Returns to overview when mouse leaves
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, MapPin } from 'lucide-react';

import { MapCheckpoint } from './MapCheckpoint';
import { MapRoads } from './MapRoads';
import { MapCharacter } from './MapCharacter';
import { ForestMapData, CheckpointClickEvent, MapLayoutConfig, DEFAULT_MAP_LAYOUT_CONFIG } from './types';
import { generateForestMap, getWalkingWaypoints } from './layoutAlgorithm';
import { NodePopup } from '@/components/flow/NodePopup';

import { useGraphStore } from '@/store/graphStore';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/utils/cn';

const ASSETS = {
  background: '/assets/map/map.png',
};

interface ForestMapProps {
  onCheckpointClick?: (event: CheckpointClickEvent) => void;
  className?: string;
  config?: Partial<MapLayoutConfig>;
}

export function ForestMap({ onCheckpointClick, className, config }: ForestMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // View states
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [manualZoom, setManualZoom] = useState(1);
  const [manualPan, setManualPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [walkingWaypoints, setWalkingWaypoints] = useState<{ x: number; y: number }[] | undefined>();

  const { currentGraph, openNodePopup, isNodePopupOpen, closeNodePopup, getSelectedNode } = useGraphStore();
  const { userSkills, careerGoals } = useUserStore();
  const selectedNode = getSelectedNode();

  const layoutConfig = useMemo(
    () => ({ ...DEFAULT_MAP_LAYOUT_CONFIG, ...config }),
    [config]
  );

  // Generate map data
  const mapData: ForestMapData | null = useMemo(() => {
    if (!currentGraph) return null;
    return generateForestMap(currentGraph, userSkills, careerGoals, layoutConfig);
  }, [currentGraph, userSkills, careerGoals, layoutConfig]);

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate auto-fit zoom and pan to show entire map
  const autoFitView = useMemo(() => {
    if (!mapData) return { zoom: 1, panX: 0, panY: 0 };

    const mapWidth = mapData.dimensions.width;
    const mapHeight = mapData.dimensions.height;

    // Add padding
    const padding = 40;
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;

    // Calculate zoom to fit
    const zoomX = availableWidth / mapWidth;
    const zoomY = availableHeight / mapHeight;
    const zoom = Math.min(zoomX, zoomY, 1); // Never zoom in more than 100%

    // Center the map
    const scaledWidth = mapWidth * zoom;
    const scaledHeight = mapHeight * zoom;
    const panX = (containerSize.width - scaledWidth) / 2;
    const panY = (containerSize.height - scaledHeight) / 2;

    return { zoom, panX, panY };
  }, [mapData, containerSize]);

  // Current view (auto-fit or manual)
  const currentView = useMemo(() => {
    if (isInteracting) {
      return {
        zoom: manualZoom,
        panX: manualPan.x,
        panY: manualPan.y,
      };
    }
    return autoFitView;
  }, [isInteracting, manualZoom, manualPan, autoFitView]);

  // Initialize manual view from auto-fit when starting interaction
  const startInteraction = useCallback(() => {
    if (!isInteracting) {
      setManualZoom(autoFitView.zoom);
      setManualPan({ x: autoFitView.panX, y: autoFitView.panY });
      setIsInteracting(true);
    }
  }, [isInteracting, autoFitView]);

  // Return to overview
  const returnToOverview = useCallback(() => {
    if (!isDragging) {
      setIsInteracting(false);
    }
  }, [isDragging]);

  // Handle checkpoint click
  const handleCheckpointClick = useCallback(
    (event: CheckpointClickEvent) => {
      if (mapData && event.checkpointId !== mapData.character.currentCheckpointId) {
        const waypoints = getWalkingWaypoints(
          mapData,
          mapData.character.currentCheckpointId,
          event.checkpointId
        );
        if (waypoints.length > 0) {
          setWalkingWaypoints(waypoints);
        }
      }
      onCheckpointClick?.(event);
      if (event.checkpoint.skillId) {
        openNodePopup(event.checkpointId);
      }
    },
    [mapData, onCheckpointClick, openNodePopup]
  );

  const handleWalkComplete = useCallback(() => {
    setWalkingWaypoints(undefined);
  }, []);

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    startInteraction();
    setManualZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  }, [startInteraction]);

  // Reset to overview
  const handleResetView = useCallback(() => {
    setIsInteracting(false);
  }, []);

  // Pan/drag handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      startInteraction();
      setIsDragging(true);
      setDragStart({ x: e.clientX - manualPan.x, y: e.clientY - manualPan.y });
    },
    [manualPan, startInteraction]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setManualPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    startInteraction();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setManualZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  }, [startInteraction]);

  if (!mapData) {
    return (
      <div className={cn('relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-xl overflow-hidden', className)}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${ASSETS.background})` }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center bg-white/95 dark:bg-slate-800/95 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-cream-50 mb-2">
              No Adventure Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set a career goal to generate your skill map!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-xl overflow-hidden',
        isDragging ? 'cursor-grabbing' : isInteracting ? 'cursor-grab' : 'cursor-default',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        // Delay return to overview to allow for click interactions
        setTimeout(returnToOverview, 300);
      }}
      onWheel={handleWheel}
    >
      {/* Map content */}
      <motion.div
        className="absolute origin-top-left will-change-transform"
        animate={{
          x: currentView.panX,
          y: currentView.panY,
          scale: currentView.zoom,
        }}
        transition={{
          type: 'tween',
          duration: isInteracting ? 0.05 : 0.3,
          ease: 'easeOut',
        }}
        style={{
          width: mapData.dimensions.width,
          height: mapData.dimensions.height,
        }}
      >
        {/* Tiled background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${ASSETS.background})`,
            backgroundSize: '500px 350px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-green-900/10" />

        {/* Roads layer */}
        <MapRoads
          roads={mapData.roads}
          width={mapData.dimensions.width}
          height={mapData.dimensions.height}
        />

        {/* Checkpoints layer */}
        <AnimatePresence>
          {mapData.checkpoints.map((checkpoint) => (
            <MapCheckpoint
              key={checkpoint.id}
              checkpoint={checkpoint}
              isCharacterHere={checkpoint.id === mapData.character.currentCheckpointId}
              onClick={handleCheckpointClick}
            />
          ))}
        </AnimatePresence>

        {/* Character layer */}
        <MapCharacter
          character={mapData.character}
          walkingWaypoints={walkingWaypoints}
          onWalkComplete={handleWalkComplete}
        />
      </motion.div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <ControlButton
          onClick={() => handleZoom(-0.15)}
          icon={<ZoomOut className="w-5 h-5" />}
          tooltip="Zoom Out"
        />
        <ControlButton
          onClick={() => handleZoom(0.15)}
          icon={<ZoomIn className="w-5 h-5" />}
          tooltip="Zoom In"
        />
        <ControlButton
          onClick={handleResetView}
          icon={<Maximize2 className="w-5 h-5" />}
          tooltip="Fit to Screen"
          highlighted={isInteracting}
        />
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-lg backdrop-blur-sm">
        {isInteracting ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Navigation Mode
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Overview ({Math.round(currentView.zoom * 100)}%)
          </span>
        )}
      </div>

      {/* Legend */}
      <MapLegend />

      {/* Map title */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-lg shadow-lg">
        <span className="font-bold text-sm">🗺️ Skill Adventure Map</span>
      </div>

      {/* Hint for large maps */}
      {!isInteracting && autoFitView.zoom < 0.7 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg">
          Click and drag to explore • Scroll to zoom
        </div>
      )}

      {/* Node Popup */}
      <NodePopup
        node={selectedNode}
        isOpen={isNodePopupOpen}
        onClose={closeNodePopup}
      />
    </div>
  );
}

// ============================================
// SUPPORTING COMPONENTS
// ============================================

function ControlButton({
  onClick,
  icon,
  tooltip,
  highlighted = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  highlighted?: boolean;
}) {
  return (
    <motion.button
      className={cn(
        'p-2.5 rounded-lg shadow-lg border backdrop-blur-sm',
        'hover:bg-gray-100 dark:hover:bg-slate-700',
        highlighted
          ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
          : 'bg-white/95 dark:bg-slate-800/95 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={tooltip}
    >
      {icon}
    </motion.button>
  );
}

function MapLegend() {
  return (
    <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 rounded-lg p-3 shadow-lg text-xs backdrop-blur-sm">
      <div className="font-bold text-gray-700 dark:text-gray-300 mb-2">Legend</div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
          <span className="text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-sm" />
          <span className="text-gray-600 dark:text-gray-400">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 shadow-sm" />
          <span className="text-gray-600 dark:text-gray-400">Locked</span>
        </div>
      </div>
    </div>
  );
}
