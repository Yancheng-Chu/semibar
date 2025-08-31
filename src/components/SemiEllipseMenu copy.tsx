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
  const [currentPage, setCurrentPage] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  // 检查grid格子是否与椭圆碰撞
  const isGridCellOverlapWithEllipse = (row: number, col: number) => {
    const gridRows = 6;
    const gridCols = 4;
    
    // 椭圆参数: 中心在(0%, 50%)，半径(300px, 40vh)
    const ellipseCenterX = 0; // 椭圆中心X坐标相对于矩形左边缘
    const ellipseCenterY = 0.5; // 椭圆中心Y坐标相对于矩形高度(50%)
    const ellipseRadiusX = 300; // 椭圆X半径(px)
    const ellipseRadiusY = 0.4; // 椭圆Y半径(40vh相对于矩形高度)
    
    // 计算格子的相对位置
    const cellX = (col / gridCols); // 格子左边缘相对于矩形宽度的比例
    const cellXRight = ((col + 1) / gridCols); // 格子右边缘
    const cellY = (row / gridRows); // 格子上边缘相对于矩形高度的比例  
    const cellYBottom = ((row + 1) / gridRows); // 格子下边缘
    
    // 椭圆在600px宽度中的实际范围
    const ellipseXInRect = ellipseRadiusX / 600; // 椭圆X半径相对于矩形宽度的比例
    
    // 检查格子是否与椭圆相交
    const overlapX = cellX < ellipseXInRect && cellXRight > 0;
    const overlapY = cellY < (ellipseCenterY + ellipseRadiusY) && cellYBottom > (ellipseCenterY - ellipseRadiusY);
    
    return overlapX && overlapY;
  };

  // 计算可用的grid位置和内容分页
  const calculateGridLayout = () => {
    const gridRows = 6;
    const gridCols = 4;
    const totalCells = gridRows * gridCols;
    const availablePositions: Array<{row: number, col: number}> = [];
    
    // 找出所有可用位置
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        if (!isGridCellOverlapWithEllipse(row, col)) {
          availablePositions.push({row, col});
        }
      }
    }
    
    return availablePositions;
  };

  const availablePositions = calculateGridLayout();
  const itemsPerPage = availablePositions.length;
  const totalItems = 48; // 示例：48个商品
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
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
      
      <div className={`ellipse-rectangle ${isExpanded ? 'expanded' : ''}`} 
           onClick={(e) => e.stopPropagation()}>
        <div className="grid-container" ref={gridRef}>
          {Array.from({length: 24}, (_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            
            // 检查当前格子是否与椭圆重叠
            const isOverlapping = isGridCellOverlapWithEllipse(row, col);
            
            if (isOverlapping) {
              return <div key={i} className="grid-item invisible"></div>;
            }
            
            // 计算当前格子在可用位置中的索引
            const availableIndex = availablePositions.findIndex(pos => pos.row === row && pos.col === col);
            
            if (availableIndex === -1) {
              return <div key={i} className="grid-item invisible"></div>;
            }
            
            // 计算当前页应该显示的内容索引
            const contentIndex = currentPage * itemsPerPage + availableIndex;
            
            if (contentIndex >= totalItems) {
              return <div key={i} className="grid-item invisible"></div>;
            }

            return (
              <div key={i} className="grid-item" onClick={(e) => {
                e.stopPropagation();
                console.log(`Item ${contentIndex + 1}`);
              }}>
                <div className="grid-icon">🎌</div>
                <div className="grid-text">{`商品${contentIndex + 1}`}</div>
              </div>
            );
          })}
        </div>
        
        {/* 分页控制 */}
        <div className="pagination-controls" onClick={(e) => e.stopPropagation()}>
          <button 
            className="pagination-btn prev" 
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            ←
          </button>
          <span className="page-indicator">
            {currentPage + 1} / {totalPages}
          </span>
          <button 
            className="pagination-btn next" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            →
          </button>
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