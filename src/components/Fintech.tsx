//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Line } from '@antv/g2plot';
import { Radio, Select } from 'antd';

const { Option, OptGroup } = Select;

const GPUUsageChart = ({ selectedProcessors, setSelectedProcessors }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const chartRef = useRef(null);
  const appleProcessors = ['m2 pro', 'm2 max', 'm3', 'm3 pro', 'm3 max', 'm2 ultra'];

  const fetchData = async () => {
    try {
      const response = await fetch('https://gpucount.2089426079.workers.dev/');
      const result = await response.json();
      setData(result.data);
      updateChart(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const nvidiaProcessors = () => {
    if (data.length > 0) {
      return Object.keys(data[0].processors).filter(p => !appleProcessors.includes(p.toLowerCase()));
    }
    return [];
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      updateChart();
    }
  }, [selectedProcessors, timeRange]);

  const updateChart = (fetchedData = data) => {
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

    const dataMap = new Map();

    fetchedData
      .filter(entry => {
        const [year, month, day, hour] = entry.file_name.split('-');
        const entryDate = new Date(year, month - 1, day, hour);
        return timeRange === 'all' || entryDate >= oneMonthAgo;
      })
      .forEach(entry => {
        const [year, month, day, hour] = entry.file_name.split('-');
        const timestamp = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:00:00`;

        selectedProcessors.forEach(processor => {
          let count = 0;
          if (processor.toLowerCase().includes('a100')) {
            count = Object.entries(entry.processors)
              .filter(([key]) => key.toLowerCase().includes('a100'))
              .reduce((sum, [, value]) => sum + value, 0);
          } else {
            count = entry.processors[processor] || 0;
          }

          const key = `${timestamp}-${processor}`;
          dataMap.set(key, {
            date: timestamp,
            processor: processor === 'a100' ? 'A100' : processor,
            count: count
          });
        });
      });

    const sortedData = Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    setChartData(sortedData);

    if (chartRef.current) {
      chartRef.current.update({
        data: sortedData,
      });
    } else {
      renderChart(sortedData);
    }
  };

  const renderChart = (data) => {
    const chart = new Line(document.getElementById('chartContainer'), {
      data: data,
      xField: 'date',
      yField: 'count',
      seriesField: 'processor',
      xAxis: {
        type: 'time',
        tickCount: 5,
      },
      yAxis: {
        title: {
          text: 'GPU Count',
        },
      },
      legend: {
        position: 'top',
      },
      connectNulls: false,
      animation: {
        appear: {
          animation: 'wave-in',
          duration: 1500,
        },
      },
      theme: 'dark',
      lineStyle: {
        lineWidth: 3,
      },
    });
    chart.render();
    chartRef.current = chart;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">处理器数量历史数据</h1>
      <div className="mb-4">
        <Radio.Group value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <Radio.Button value="month">Last Month</Radio.Button>
          <Radio.Button value="all">All Time</Radio.Button>
        </Radio.Group>
      </div>

      <div className="mb-4">
        <Select
          mode="multiple"
          value={selectedProcessors}
          style={{ width: '100%' }}
          placeholder="Select processors"
          onChange={setSelectedProcessors}
        >
          <OptGroup label="NVIDIA">
            {nvidiaProcessors().map(processor => (
              <Option key={processor} value={processor}>
                {processor}
              </Option>
            ))}
          </OptGroup>
          <OptGroup label="Apple">
            {appleProcessors.map(processor => (
              <Option key={processor} value={processor}>
                {processor}
              </Option>
            ))}
          </OptGroup>
        </Select>
      </div>

      <div id="chartContainer" style={{ width: '100%', height: '500px', backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px' }}></div>
    </div>
  );
};

export default GPUUsageChart;
