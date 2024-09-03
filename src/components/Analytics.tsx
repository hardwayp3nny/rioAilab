//@ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Select } from 'antd';
import axios from 'axios';
import { Line } from '@antv/g2plot';

const { Option, OptGroup } = Select;

const ChartCard = ({ selectedProcessors, setSelectedProcessors }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const chartRef = useRef(null);
  const dataCache = useRef(new Map());

  const appleProcessors = ['m2 pro', 'm2 max', 'm3', 'm3 pro', 'm3 max', 'm2 ultra'];

  const nvidiaProcessors = useCallback(() => {
    if (data.length > 0) {
      return Array.from(new Set(data.map(item => item.processor.toLowerCase()))).filter(
        p => !appleProcessors.includes(p)
      );
    }
    return [];
  }, [data]);

  const fetchData = useCallback(async () => {
    const cacheKey = `${timeRange}_${Date.now()}`;
    const cachedData = dataCache.current.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
      setData(cachedData.data);
      filterData(cachedData.data);
      return;
    }

    const endTime = Date.now();
    const startTime = endTime - (parseInt(timeRange) * 24 * 60 * 60 * 1000);

    try {
      const priceResponse = await axios.get('https://api.binance.com/api/v3/klines', {
        params: { symbol: 'IOUSDT', interval: '1h', startTime, endTime },
      });

      const priceData = new Map(
        priceResponse.data.map(item => [
          new Date(item[0]).toISOString().slice(0, 19) + 'Z',
          parseFloat(item[4]),
        ])
      );

      const rewardResponse = await axios.get('https://apiweb.2089426079.workers.dev/');
      const processorData = rewardResponse.data.processorData;

      const mergedData = processorData
        .flatMap(item => {
          const datetime = new Date(item.datetime).toISOString().slice(0, 19) + 'Z';
          const price = priceData.get(datetime);
          if (price === undefined) return [];

          const rewards = item.processors.reduce((acc, processor) => {
            let processorName = processor.name.toLowerCase();

            const rewardUSD = parseFloat((processor.reward * price).toFixed(2));
            acc[processorName] = (acc[processorName] || 0) + rewardUSD;
            return acc;
          }, {});

          return Object.keys(rewards).map(processorName => ({
            date: datetime,
            processor: processorName,
            count: rewards[processorName],
          }));
        })
        .filter(item => item.count > 0);

      setData(mergedData);
      filterData(mergedData);

      dataCache.current.set(cacheKey, { data: mergedData, timestamp: Date.now() });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [timeRange]);

  const filterData = useCallback(
    (dataToFilter = data) => {
      const filtered = dataToFilter.filter(item => selectedProcessors.includes(item.processor));
      setFilteredData(filtered);
      updateChart(filtered);
    },
    [selectedProcessors, data]
  );

  const updateChart = (chartData) => {
    if (chartRef.current) {
      chartRef.current.update({
        data: chartData,
      });
    } else {
      renderChart(chartData);
    }
  };

  const renderChart = (chartData) => {
    const chart = new Line(document.getElementById('chartContainer'), {
      data: chartData,
      xField: 'date',
      yField: 'count',
      seriesField: 'processor',
      xAxis: {
        type: 'time',
        tickCount: 5,
      },
      yAxis: {
        title: {
          text: 'Reward (USD)',
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data.length > 0) {
      filterData();
    }
  }, [selectedProcessors, filterData, data]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">处理器收益历史曲线（USD/Hour）</h1>
      <div className="mb-4">
        <Radio.Group value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <Radio.Button value="7d">Last 7 Days</Radio.Button>
          <Radio.Button value="30d">30 Days</Radio.Button>
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

export default ChartCard;
