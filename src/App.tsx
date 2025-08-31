import { useState } from 'react'
import SemiEllipseMenu from './components/SemiEllipseMenu'
import Semibar from './components/semibar'
import './App.css'

function App() {
  const [selectedOption, setSelectedOption] = useState<string>('')

  const menuOptions = [
    { id: '1', label: '手机 / 电脑 / 数码' },
    { id: '2', label: '游戏 / 影音 / 二次元' },
    { id: '3', label: '出行 / 体育 / 演唱会' },
    { id: '4', label: '家电 / 家具 / 家装' },
    { id: '5', label: '服饰 / 美妆 / 香氛' },
    { id: '6', label: '母婴 / 宠物 / 健身' },
    { id: '7', label: '食品 / 酒水 / 医疗' },
    { id: '8', label: '五金 / 园艺 / 租房' },
    { id: '9', label: '珠宝 / 礼品 / 文创' },
    { id: '10', label: '办公 / 图书 / 乐器' },
  ];

  const handleOptionClick = (option: { id: string; label: string }) => {
    setSelectedOption(option.label);
    console.log('选中的菜单项:', option);
  };

  return (
    <div className="app">
      <SemiEllipseMenu 
        options={menuOptions}
        onOptionClick={handleOptionClick}
      />
      {/* <Semibar 
        options={menuOptions}
        onOptionClick={handleOptionClick}
      /> */}
    </div>
  )
}

export default App
