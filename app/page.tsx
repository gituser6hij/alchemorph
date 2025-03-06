"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type ShapeType = 'circle' | 'square' | 'triangle' | 'pentagram' | 'hexagram';
type ColorPalette = string[];

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'pentagram', 'hexagram'];
const COLOR_PALETTE: ColorPalette = [
  '#e8c547ff', '#30323dff', '#4d5061ff', '#fe5f55ff',
  '#fceff9ff', '#f6ca83ff', '#f5d6baff', '#fff', '#000'
];
const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double'];

// Add easing functions for smoother transitions
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
  const [style, setStyle] = useState<ShapeStyle>({
    backgroundColor: '#e8c547ff',
    borderColor: '#30323dff',
    borderWidth: 4,
    borderStyle: 'solid',
    size: 300,
    rotation: 0,
    scale: 1
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateRandomStyle = useCallback(() => {
    setPreviousShape(currentShape);
    setIsTransitioning(true);
    
    // First create a shrinking effect
    setStyle(prev => ({
      ...prev,
      scale: 0.5,
      rotation: prev.rotation + 180,
    }));
    
    // Then after a delay, switch the shape and expand
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const newStyle = {
        backgroundColor: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
        borderColor: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
        borderWidth: Math.floor(Math.random() * 12) + 1,
        borderStyle: BORDER_STYLES[Math.floor(Math.random() * BORDER_STYLES.length)],
        size: Math.floor(Math.random() * 200) + 200,
        rotation: Math.floor(Math.random() * 360),
        scale: 1
      };
      
      setCurrentShape(newShape);
      setStyle(newStyle);
      localStorage.setItem('alchemyStyle', JSON.stringify({...newStyle, shape: newShape}));
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 300);
  }, [currentShape]);

  const changeShapeOnly = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setPreviousShape(currentShape);
    setIsTransitioning(true);
    
    // Create shrinking effect first
    setStyle(prev => ({
      ...prev,
      scale: 0.5,
      rotation: prev.rotation + 90,
    }));
    
    // After delay, change shape and expand
    setTimeout(() => {
      const nextShape = SHAPES[(SHAPES.indexOf(currentShape) + 1) % SHAPES.length];
      setCurrentShape(nextShape);
      
      setStyle(prev => ({
        ...prev,
        scale: 1,
      }));
      
      localStorage.setItem('alchemyStyle', JSON.stringify({...style, shape: nextShape}));
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 300);
  }, [currentShape, style]);

  // Load saved style
  useEffect(() => {
    const savedStyle = localStorage.getItem('alchemyStyle');
    if (savedStyle) {
      const parsedStyle = JSON.parse(savedStyle);
      setStyle({
        ...parsedStyle,
        rotation: parsedStyle.rotation || 0,
        scale: parsedStyle.scale || 1
      });
      setCurrentShape(parsedStyle.shape || 'circle');
      setPreviousShape(parsedStyle.shape || 'circle');
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#30323dff] flex items-center justify-center p-4">
      <div 
        className="relative cursor-pointer"
        onClick={generateRandomStyle}
      >
        <div className="relative overflow-visible flex items-center justify-center">
          {/* Particle effects during transition */}
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
                    animation: `particle 0.8s ease-out ${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {renderShape()}
        </div>
        
        {/* Control Bar */}
        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={changeShapeOnly}
            className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            Change Shape
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateRandomStyle();
            }}
            className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            Randomize All
          </button>
        </div>
      </div>
      
      {/* Add CSS for the particle animation */}
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