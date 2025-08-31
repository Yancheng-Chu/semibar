import { useState } from 'react'
import SemiEllipseMenu from './components/SemiEllipseMenu'
import './App.css'

function App() {
  const [selectedOption, setSelectedOption] = useState<string>('')

  const menuOptions = [
    { id: '1', label: '首页' },
    { id: '2', label: '用户管理' },
    { id: '3', label: '数据分析' },
    { id: '4', label: '系统设置' },
    { id: '5', label: '消息中心' },
    { id: '6', label: '文件管理' },
    { id: '7', label: '权限管理' },
    { id: '8', label: '日志查看' },
    { id: '9', label: '备份恢复' },
    { id: '10', label: '帮助文档' },
    { id: '11', label: '订单管理' },
    { id: '12', label: '商品管理' },
    { id: '13', label: '财务统计' },
    { id: '14', label: '客户服务' },
    { id: '15', label: '营销活动' },
    { id: '16', label: '库存管理' },
    { id: '17', label: '物流跟踪' },
    { id: '18', label: '数据导出' },
    { id: '19', label: '安全监控' },
    { id: '20', label: 'API管理' },
    { id: '21', label: '开发工具' },
    { id: '22', label: '版本控制' },
    { id: '23', label: '性能监控' },
    { id: '24', label: '错误日志' },
    { id: '25', label: '用户反馈' },
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
      
    </div>
  )
}

export default App
