import React, { useState, useEffect, useRef } from 'react';
import './SemiEllipseMenu.css';

interface MenuOption {
  id: string;
  label: string;
}

interface SemiEllipseMenuProps {
  options: MenuOption[];
  onOptionClick?: (option: MenuOption) => void;
}

const SemiEllipseMenu: React.FC<SemiEllipseMenuProps> = ({ options, onOptionClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    // 从localStorage恢复上次选中的索引
    const saved = localStorage.getItem('semi-ellipse-selected-index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    const snapToCenter = () => {
      if (contentRef.current) {
        const { scrollTop, clientHeight } = contentRef.current;
        const itemHeight = 70;
        const containerCenter = clientHeight / 2;
        const currentCenter = scrollTop + containerCenter;
        
        // 计算最接近中心的项目位置
        const nearestItemIndex = Math.round(currentCenter / itemHeight);
        const targetPosition = nearestItemIndex * itemHeight - containerCenter + (itemHeight / 2);
        
        // 平滑滚动到目标位置
        contentRef.current.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    };

    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const itemHeight = 70;
        
        // 清除之前的定时器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // 计算中心位置的项目索引
        const centerPosition = scrollTop + clientHeight / 2;
        const currentIndex = Math.floor(centerPosition / itemHeight) % options.length;
        if (currentIndex !== selectedIndex) {
          setSelectedIndex(currentIndex);
          localStorage.setItem('semi-ellipse-selected-index', currentIndex.toString());
        }
        
        // 设置磁吸定时器 - 滚动停止150ms后自动对齐
        scrollTimeoutRef.current = window.setTimeout(snapToCenter, 150);
        
        // 无限循环逻辑
        if (scrollTop <= 0) {
          contentRef.current.scrollTop = scrollHeight - clientHeight - itemHeight;
        } else if (scrollTop >= scrollHeight - clientHeight) {
          contentRef.current.scrollTop = itemHeight;
        }
      }
    };

    const handleMouseLeave = () => {
      // 鼠标离开时也触发磁吸对齐
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(snapToCenter, 100);
    };

    const currentContentRef = contentRef.current;
    if (currentContentRef && isExpanded) {
      currentContentRef.addEventListener('scroll', handleScroll);
      currentContentRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', handleScroll);
        currentContentRef.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isExpanded, options.length, selectedIndex]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    
    // 当展开时，滚动到上次选中的项目位置
    if (!isExpanded && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          const itemHeight = 70;
          const containerHeight = contentRef.current.clientHeight;
          // 中间组的选中项位置
          const selectedItemInMiddleGroup = options.length * itemHeight + selectedIndex * itemHeight;
          // 椭圆中心位置偏移
          const centerOffset = (containerHeight / 2) - (itemHeight / 2);
          contentRef.current.scrollTop = selectedItemInMiddleGroup - centerOffset;
        }
      }, 50);
    }
  };

  const handleOptionClick = (option: MenuOption) => {
    onOptionClick?.(option);
    setIsExpanded(false);
  };

  return (
    <div ref={menuRef} className="semi-ellipse-menu">
      <div 
        className={`menu-trigger ${isExpanded ? 'expanded' : ''}`}
        onClick={handleToggle}
      >
        <div className="arrow-icon">
          →
        </div>
        <div className="menu-label">类目</div>
      </div>
      
      <div className={`ellipse-rectangle ${isExpanded ? 'expanded' : ''}`}>
        <div className="grid-container">
          {Array.from({length: 24}, (_, i) => {
            // 计算当前格子的行列位置 (6行4列)
            const row = Math.floor(i / 4);
            const col = i % 4;
            
            // 检查是否在椭圆区域内 (椭圆中心在50%高度，半径40vh)
            const gridHeight = 6;
            const centerRow = (gridHeight - 1) / 2; // 2.5
            const ellipseRadius = 2; // 大约2行的范围
            
            const distanceFromCenter = Math.abs(row - centerRow);
            const isInEllipse = col === 0 && distanceFromCenter <= ellipseRadius;
            
            if (isInEllipse) {
              return <div key={i} className="grid-item invisible"></div>;
            }
            
            return (
              <div key={i} className="grid-item">
                <div className="grid-icon">🎌</div>
                <div className="grid-text">动漫周边</div>
              </div>
            );
          })}
        </div>
        <div className="ellipse-mask"></div>
      </div>
      
      <div className={`menu-container ${isExpanded ? 'expanded' : ''}`}>
        <div className="menu-content" ref={contentRef}>
          {[...options, ...options, ...options].map((option, index) => {
            const optionIndex = index % options.length;
            const isSelected = optionIndex === selectedIndex;
            return (
              <div
                key={`${option.id}-${index}`}
                className={`menu-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                <span className="option-label">{option.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SemiEllipseMenu;