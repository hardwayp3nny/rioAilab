// @ts-nocheck
import ROICalculator from './ROICalculator';
import WorkInProgress from './WorkInProgress';
import React, { useState, useEffect } from 'react';
import { Radio, Card, Row, Col, Typography, Button } from 'antd';
import axios from 'axios';
import ChartCardByRevenue from './Analytics';
import ChartCardByQuantity from './Fintech';
import AnnouncementComponent from './announcements'; // 导入新的公告组件
import { Link } from 'react-router-dom';
const { Title, Text } = Typography;

const IOPrice = () => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
          params: { symbol: 'IOUSDT' }
        });
        setPrice(parseFloat(response.data.price).toFixed(4));
        setLoading(false);
      } catch (err) {
        setError('Error fetching price');
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <Title level={4}>IO/USDT：</Title>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text type="danger">{error}</Text>
      ) : (
        <Text strong>{price} USDT</Text>
      )}
    </Card>
  );
};

const InfoCard = ({ title, content }) => (
  <Card>
    <Title level={4}>{title}</Title>
    <Text>{content}</Text>
  </Card>
);

const ChartSelector = () => {
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [selectedProcessors, setSelectedProcessors] = useState(['a100 40g', 'm2 pro', 'rtx 4090']); // 初始化处理器选项状态
  const [showWorkInProgress, setShowWorkInProgress] = useState(false);
  const [showROICalculator, setShowROICalculator] = useState(false);

  if (showWorkInProgress) {
    return (
      <div className="flex flex-col col-span-full sm:col-span-12 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <Button
          onClick={() => setShowWorkInProgress(false)}
          style={{ marginBottom: 16 }}
        >
          Back to Dashboard
        </Button>
        <WorkInProgress />
      </div>
    );
  }

  if (showROICalculator) {
    return (
      <div className="flex flex-col col-span-full sm:col-span-12 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <Button
          onClick={() => setShowROICalculator(false)}
          style={{ marginBottom: 16 }}
        >
          Back to Dashboard
        </Button>
        <ROICalculator />
      </div>
    );
  }

  return (
    <div className="flex flex-col col-span-full sm:col-span-12 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <Card title="Rio的AI工作室-IO.Net">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <InfoCard title="当前认证设备数" content="322,145" />
          </Col>
          <Col span={12}>
            <InfoCard title="IO区块奖励发放数" content="7,564,647.266 IO" />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <InfoCard title="全网用户收益" content="$1,276,684.182" />
          </Col>
          <Col span={12}>
            <IOPrice />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="DePIN 项目教程分享">
  <a href="https://depin-kappa.vercel.app/" target="_blank" rel="noopener noreferrer">
    <Button type="link">
      查看 DePIN 项目教程
    </Button>
  </a>
</Card>

          </Col>
        </Row>
        {/* 新增公告组件 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="公告">
              <AnnouncementComponent />
            </Card>
          </Col>
        </Row>
        {/* 新增ROI计算器按钮 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="ROI 计算器">
              <Button type="primary" onClick={() => setShowROICalculator(true)}>
                打开 ROI 计算器
              </Button>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Radio.Group
                  value={selectedChart}
                  onChange={(e) => setSelectedChart(e.target.value)}
                >
                  <Radio.Button value="revenue">按收益</Radio.Button>
                  <Radio.Button value="quantity">按数量</Radio.Button>
                </Radio.Group>
              </div>
              {/* 根据selectedChart显示不同的图表，并传递selectedProcessors和setSelectedProcessors */}
              {selectedChart === 'revenue' ? (
                <ChartCardByRevenue
                  selectedProcessors={selectedProcessors}
                  setSelectedProcessors={setSelectedProcessors}
                />
              ) : (
                <ChartCardByQuantity
                  selectedProcessors={selectedProcessors}
                  setSelectedProcessors={setSelectedProcessors}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartSelector;
