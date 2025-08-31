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
  const isProgrammaticScrollRef = useRef(false);

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
      if (contentRef.current && !isProgrammaticScrollRef.current) {
        const { scrollTop, clientHeight } = contentRef.current;
        const itemHeight = 70;
        const containerCenter = clientHeight / 2;
        const currentCenter = scrollTop + containerCenter;
        
        // 计算最接近中心的项目索引
        const nearestItemIndex = Math.round((currentCenter - itemHeight / 2) / itemHeight);
        // 计算该项目应该在容器正中心的位置
        const targetPosition = nearestItemIndex * itemHeight + itemHeight / 2 - containerCenter;
        
        // 设置程序性滚动标志
        isProgrammaticScrollRef.current = true;
        
        // 平滑滚动到目标位置
        contentRef.current.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // 重置程序性滚动标志
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      }
    };

    const handleScroll = () => {
      if (contentRef.current && !isProgrammaticScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const itemHeight = 70;
        
        // 清除之前的定时器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // 计算中心位置的项目索引
        const centerPosition = scrollTop + clientHeight / 2;
        // 更精确的索引计算，考虑项目中心点
        const rawIndex = Math.round((centerPosition - itemHeight / 2) / itemHeight);
        const currentIndex = ((rawIndex % options.length) + options.length) % options.length;
        
        if (currentIndex !== selectedIndex && currentIndex >= 0) {
          setSelectedIndex(currentIndex);
          localStorage.setItem('semi-ellipse-selected-index', currentIndex.toString());
        }
        
        // 设置磁吸定时器 - 滚动停止150ms后自动对齐
        scrollTimeoutRef.current = window.setTimeout(snapToCenter, 150);
        
        // 优化的无限循环逻辑 - 只在接近边界时才触发
        const threshold = itemHeight * 0.5;
        if (scrollTop <= threshold) {
          isProgrammaticScrollRef.current = true;
          contentRef.current.scrollTop = scrollHeight - clientHeight - itemHeight + threshold;
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 100);
        } else if (scrollTop >= scrollHeight - clientHeight - threshold) {
          isProgrammaticScrollRef.current = true;
          contentRef.current.scrollTop = itemHeight - threshold;
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 100);
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
          isProgrammaticScrollRef.current = true;
          const itemHeight = 70;
          const containerHeight = contentRef.current.clientHeight;
          const containerCenter = containerHeight / 2;
          
          // 中间组的选中项位置（项目的中心点）
          const selectedItemInMiddleGroup = options.length * itemHeight + selectedIndex * itemHeight + itemHeight / 2;
          // 计算滚动位置，让选中项的中心点对齐容器中心
          const scrollPosition = selectedItemInMiddleGroup - containerCenter;
          
          contentRef.current.scrollTop = scrollPosition;
          
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 200);
        }
      }, 50);
    }
  };

  const handleOptionClick = (option: MenuOption, index: number) => {
    const actualIndex = index % options.length;
    setSelectedIndex(actualIndex);
    localStorage.setItem('semi-ellipse-selected-index', actualIndex.toString());
    onOptionClick?.(option);
    // 不再自动关闭菜单，只有点击外部区域才关闭
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
      
      <div className={`menu-container ${isExpanded ? 'expanded' : ''}`}>
        <div className="menu-content" ref={contentRef}>
          {[...options, ...options, ...options].map((option, index) => {
            const optionIndex = index % options.length;
            const isSelected = optionIndex === selectedIndex;
            return (
              <div
                key={`${option.id}-${index}`}
                className={`menu-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option, index)}
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