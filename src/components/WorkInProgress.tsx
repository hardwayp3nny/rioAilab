// WorkInProgress.js
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const WorkInProgress = () => {
  return (
    <div className="flex flex-col col-span-full sm:col-span-12 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <Card title="Work in Progress">
        <Title level={3}>Coming Soon</Title>
        <Text>We're working hard to bring you new features and content. Please check back later!</Text>
      </Card>
    </div>
  );
};

export default WorkInProgress;
