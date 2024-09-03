import React, { useState } from 'react';
import ChartCard from './Analytics'; // 收益曲线组件
import GPUUsageChart from './Fintech'; // 数量曲线组件

const ParentComponent = () => {
  const [selectedProcessors, setSelectedProcessors] = useState(['m2 pro', 'm2 max', 'm3']); // 初始状态设置为默认选项
  const [selectedChart, setSelectedChart] = useState('revenue'); // 控制当前显示的图表

  return (
    <div>
      {/* 切换图表的按钮 */}
      <div>
        <button onClick={() => setSelectedChart('revenue')}>显示收益曲线</button>
        <button onClick={() => setSelectedChart('quantity')}>显示数量曲线</button>
      </div>

      {/* 根据选择显示不同的图表，并传递selectedProcessors和setSelectedProcessors */}
      {selectedChart === 'revenue' ? (
        <ChartCard
          selectedProcessors={selectedProcessors}
          setSelectedProcessors={setSelectedProcessors}
        />
      ) : (
        <GPUUsageChart
          selectedProcessors={selectedProcessors}
          setSelectedProcessors={setSelectedProcessors}
        />
      )}
    </div>
  );
};

export default ParentComponent;
