"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Updated ShapeType to include new alchemical shapes
type ShapeType = 'circle' | 'square' | 'triangle' | 'waterTriangle' | 'pentagram' | 'hexagram' | 'philosopherStone';

// Define alchemical stages with corresponding color palettes
const ALCHEMICAL_STAGES = [
  { name: 'nigredo', colors: ['#000000', '#1a1a1a', '#333333'] },
  { name: 'albedo', colors: ['#ffffff', '#f0f0f0', '#e0e0e0'] },
  { name: 'citrinitas', colors: ['#ffd700', '#ffec8b', '#f0e68c'] },
  { name: 'rubedo', colors: ['#ff0000', '#dc143c', '#b22222'] },
];

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'waterTriangle', 'pentagram', 'hexagram', 'philosopherStone'];
const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double'];

// Easing functions for transitions
const EASING = {
  easeOutElastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeOutBack: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
  easeInOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
};

interface ShapeStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  size: number;
  shape?: ShapeType;
  rotation: number;
  scale: number;
}

export default function AlchemyShapes() {
  const [currentShape, setCurrentShape] = useState<ShapeType>('circle');
  const [previousShape, setPreviousShape] = useState<ShapeType>('circle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); // Track the current alchemical stage
  const [style, setStyle] = useState<ShapeStyle>({
    backgroundColor: ALCHEMICAL_STAGES[0].colors[0], // Start with nigredo
    borderColor: ALCHEMICAL_STAGES[0].colors[1],
    borderWidth: 4,
    borderStyle: 'solid',
    size: 300,
    rotation: 0,
    scale: 1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);



  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateRandomStyle = useCallback(() => {
    setPreviousShape(currentShape);
    setIsTransitioning(true);

    // Shrink the shape
    setStyle((prev) => ({
      ...prev,
      scale: 0.5,
      rotation: prev.rotation + 180,
    }));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const stageColors = ALCHEMICAL_STAGES[currentStage].colors;
      const newStyle = {
        backgroundColor: stageColors[Math.floor(Math.random() * stageColors.length)],
        borderColor: stageColors[Math.floor(Math.random() * stageColors.length)],
        borderWidth: Math.floor(Math.random() * 12) + 1,
        borderStyle: BORDER_STYLES[Math.floor(Math.random() * BORDER_STYLES.length)],
        size: Math.floor(Math.random() * 200) + 200,
        rotation: Math.floor(Math.random() * 360),
        scale: 1,
      };

      setCurrentShape(newShape);
      setStyle(newStyle);
      localStorage.setItem('alchemyStyle', JSON.stringify({ ...newStyle, shape: newShape }));
      setCurrentStage((prev) => (prev + 1) % ALCHEMICAL_STAGES.length); // Move to next stage

      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 300);
  }, [currentShape, currentStage]);

  const changeShapeOnly = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      setPreviousShape(currentShape);
      setIsTransitioning(true);

      setStyle((prev) => ({
        ...prev,
        scale: 0.5,
        rotation: prev.rotation + 90,
      }));

      setTimeout(() => {
        const nextShape = SHAPES[(SHAPES.indexOf(currentShape) + 1) % SHAPES.length];
        setCurrentShape(nextShape);

        setStyle((prev) => ({
          ...prev,
          scale: 1,
        }));

        localStorage.setItem('alchemyStyle', JSON.stringify({ ...style, shape: nextShape }));

        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 300);
    },
    [currentShape, style]
  );

  // Load saved style on mount
  useEffect(() => {
    const savedStyle = localStorage.getItem('alchemyStyle');
    if (savedStyle) {
      const parsedStyle = JSON.parse(savedStyle);
      setStyle({
        ...parsedStyle,
        rotation: parsedStyle.rotation || 0,
        scale: parsedStyle.scale || 1,
      });
      setCurrentShape(parsedStyle.shape || 'circle');
      setPreviousShape(parsedStyle.shape || 'circle');
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [isAutoChanging, setIsAutoChanging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoChanging) {
      intervalRef.current = setInterval(() => {
        generateRandomStyle();
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoChanging, generateRandomStyle]);

  const toggleAutoChange = () => {
    setIsAutoChanging((prev) => !prev);
  };


  // Swipe handling
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (Math.abs(touchEndX - touchStartX) > 50) {
        generateRandomStyle();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [generateRandomStyle]);

  const renderShape = () => {
    const transitionStyle = isTransitioning
      ? `${EASING.easeOutBack} 0.5s`
      : `${EASING.easeOutElastic} 0.8s`;

    const baseClasses = "transition-all ease-in-out transform";

    const commonStyle = {
      backgroundColor: style.backgroundColor,
      border: `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}`,
      width: style.size,
      height: style.size,
      transform: `rotate(${style.rotation}deg) scale(${style.scale})`,
      transition: `transform ${transitionStyle}, background-color 0.5s, border 0.5s, width 0.7s, height 0.7s`,
    };

    switch (currentShape) {
      case 'circle':
        return <div className={`rounded-full ${baseClasses}`} style={commonStyle} />;
      case 'square':
        return <div className={`${baseClasses}`} style={commonStyle} />;
      case 'triangle':
        return (
          <div className={`relative ${baseClasses}`} style={{ ...commonStyle, backgroundColor: 'transparent' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon
                points="50,10 90,90 10,90"
                fill={style.backgroundColor}
                stroke={style.borderColor}
                strokeWidth={style.borderWidth}
              />
            </svg>
          </div>
        );
      case 'waterTriangle':
        return (
          <div className={`relative ${baseClasses}`} style={{ ...commonStyle, backgroundColor: 'transparent' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon
                points="50,90 90,10 10,10"
                fill={style.backgroundColor}
                stroke={style.borderColor}
                strokeWidth={style.borderWidth}
              />
            </svg>
          </div>
        );
      case 'pentagram':
        return (
          <div className={`relative ${baseClasses}`} style={{ ...commonStyle, backgroundColor: 'transparent' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon
                points="50,5 61,38 98,38 67,58 78,91 50,70 22,91 33,58 2,38 39,38"
                fill={style.backgroundColor}
                stroke={style.borderColor}
                strokeWidth={style.borderWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case 'hexagram':
        return (
          <div className={`relative ${baseClasses}`} style={{ ...commonStyle, backgroundColor: 'transparent' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <polygon
                points="50,5 90,80 10,80"
                fill={style.backgroundColor}
                stroke={style.borderColor}
                strokeWidth={style.borderWidth}
              />
              <polygon
                points="50,95 90,20 10,20"
                fill={style.backgroundColor}
                stroke={style.borderColor}
                strokeWidth={style.borderWidth}
              />
            </svg>
          </div>
        );
      case 'philosopherStone':
        return (
          <div className={`relative rounded-full ${baseClasses}`} style={commonStyle}>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: style.size / 10,
                height: style.size / 10,
                backgroundColor: style.borderColor,
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#30323dff] flex items-center justify-center p-4">

      <button
        className="absolute top-4 right-16 text-black px-4 py-2 rounded"
        onClick={toggleAutoChange}
        aria-label="Toggle auto-change"
        style={{ color: `var(${style.borderColor})` }} // Apply dynamic font color
      >
        {isAutoChanging ? "⏹" : "▶"}
      </button>

      <button
        className="absolute top-4 right-4 text-black px-4 py-2 rounded"
        onClick={toggleFullScreen}
        aria-label="Toggle fullscreen"
        style={{ color: `var(${style.borderColor})` }} // Apply dynamic font color
      >
        ⛶
      </button>

      <div ref={containerRef} className="relative cursor-pointer" onClick={generateRandomStyle}>

        <div className="relative overflow-visible flex items-center justify-center">
          {isTransitioning && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: style.borderColor,
                    left: `${50 + Math.cos(i * Math.PI / 4) * 150}%`,
                    top: `${50 + Math.sin(i * Math.PI / 4) * 150}%`,
                    opacity: 0,
                    transform: 'scale(0)',
                    animation: `particle 0.8s ease-out ${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}
          {renderShape()}
        </div>
      </div>


      <style jsx>{`
        @keyframes particle {
          0% {
            opacity: 1;
            transform: scale(0);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
      `}</style>
    </main>
  );
}