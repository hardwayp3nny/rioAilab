// @ts-nocheck 

import React, { useState, useEffect } from 'react';
import { Radio, Card, Row, Col, Typography } from 'antd';
import axios from 'axios';
import ChartCardByRevenue from './Analytics';
import ChartCardByQuantity from './Fintech';

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

  return (
    <div className="flex flex-col col-span-full sm:col-span-12 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <Card title="Rio的AI工作室-IO.Net">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <InfoCard title="当前认证设备数" content="321614" />
          </Col>
          <Col span={12}>
            <InfoCard title="IO区块奖励发放数" content="6,921,592.989 IO" />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <InfoCard title="全网用户收益" content="$1,103,947" />
          </Col>
          <Col span={12}>
            <IOPrice />
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
              {selectedChart === 'revenue' ? <ChartCardByRevenue /> : <ChartCardByQuantity />}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ChartSelector;
