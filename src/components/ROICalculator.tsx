// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Select, Input, Button, Radio } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface ProcessorData {
  name: string;
  reward: number;
}

interface LatestData {
  datetime: string;
  processors: ProcessorData[];
}

const ROICalculator = () => {
  const [latestData, setLatestData] = useState<LatestData | null>(null);
  const [ioPrice, setIoPrice] = useState<number | null>(null);
  const [usdToRmbRate, setUsdToRmbRate] = useState<number | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [roiPeriod, setRoiPeriod] = useState<number | null>(null);
  const [roiUnit, setRoiUnit] = useState<'hours' | 'days' | 'months'>('days');

  const fetchLatestData = useCallback(async () => {
    try {
      const response = await axios.get('https://apiweb.2089426079.workers.dev/');
      setLatestData(response.data.processorData[response.data.processorData.length - 1]);
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  }, []);

  const fetchIoPrice = useCallback(async () => {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: { symbol: 'IOUSDT' },
      });
      setIoPrice(parseFloat(response.data.price));
    } catch (error) {
      console.error('Error fetching IO price:', error);
    }
  }, []);

  const fetchUsdToRmbRate = useCallback(async () => {
    try {
      // 注意：这里使用的是示例API，您可能需要替换为实际可用的汇率API
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      setUsdToRmbRate(response.data.rates.CNY);
    } catch (error) {
      console.error('Error fetching USD to RMB rate:', error);
    }
  }, []);

  useEffect(() => {
    fetchLatestData();
    fetchIoPrice();
    fetchUsdToRmbRate();
  }, [fetchLatestData, fetchIoPrice, fetchUsdToRmbRate]);

  const calculateROI = () => {
    if (!latestData || !ioPrice || !usdToRmbRate || !selectedProcessor || !purchasePrice) {
      alert('Please ensure all data is loaded and inputs are filled.');
      return;
    }

    const selectedProcessorData = latestData.processors.find(
      p => p.name.toLowerCase() === selectedProcessor.toLowerCase()
    );

    if (!selectedProcessorData) {
      alert('Selected processor not found in the latest data.');
      return;
    }

    const hourlyRewardUsd = selectedProcessorData.reward * ioPrice;
    const hourlyRewardRmb = hourlyRewardUsd * usdToRmbRate;
    const hoursToROI = purchasePrice / hourlyRewardRmb;

    let result: number;
    switch (roiUnit) {
      case 'hours':
        result = hoursToROI;
        break;
      case 'days':
        result = hoursToROI / 24;
        break;
      case 'months':
        result = hoursToROI / (24 * 30);
        break;
    }

    setRoiPeriod(parseFloat(result.toFixed(2)));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ROI Calculator</h1>

      <div className="mb-4">
        <Select
          style={{ width: 200 }}
          placeholder="Select Processor"
          onChange={(value) => setSelectedProcessor(value)}
        >
          {latestData?.processors.map((p) => (
            <Option key={p.name} value={p.name}>{p.name}</Option>
          ))}
        </Select>
      </div>

      <div className="mb-4">
        <Input
          type="number"
          placeholder="Purchase Price (RMB)"
          onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <Radio.Group value={roiUnit} onChange={(e) => setRoiUnit(e.target.value)}>
          <Radio.Button value="hours">Hours</Radio.Button>
          <Radio.Button value="days">Days</Radio.Button>
          <Radio.Button value="months">Months</Radio.Button>
        </Radio.Group>
      </div>

      <Button onClick={calculateROI}>Calculate ROI</Button>

      {roiPeriod !== null && (
        <div className="mt-4">
          <h2 className="text-xl">
            Estimated ROI Period: {roiPeriod} {roiUnit}
          </h2>
        </div>
      )}
    </div>
  );
};

export default ROICalculator;
