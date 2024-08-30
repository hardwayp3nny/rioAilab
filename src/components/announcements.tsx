// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Select, Typography, Spin } from 'antd';

const { Option } = Select;
const { Paragraph } = Typography;

const AnnouncementComponent = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('https://edit.2089426079.workers.dev/');
      const data = await response.text();
      const decodedData = decodeContent(data);
      const splitAnnouncements = decodedData.split(/\d+\./);
      const filteredAnnouncements = splitAnnouncements.filter(a => a.trim() !== '');
      setAnnouncements(filteredAnnouncements);
      setSelectedAnnouncement(filteredAnnouncements[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  // 更新后的解码函数
  const decodeContent = (content) => {
    return content.replace(/&#?\d+;|[^&;]+/g, match => {
      if (match.startsWith('&#')) {
        const asciiCode = parseInt(match.slice(2, -1), 10);
        return String.fromCharCode(asciiCode);
      } else if (match.startsWith('&')) {
        const asciiCode = parseInt(match.slice(1, -1), 10);
        return String.fromCharCode(asciiCode);
      } else {
        return match;
      }
    });
  };

  const handleChange = (value) => {
    setSelectedAnnouncement(announcements[value]);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Select
        style={{ width: 200, marginBottom: 20 }}
        onChange={handleChange}
        defaultValue="0"
      >
        {announcements.map((_, index) => (
          <Option key={index} value={index.toString()}>
            公告 {index + 1}
          </Option>
        ))}
      </Select>

      {selectedAnnouncement && (
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #d9d9d9',
            padding: '10px'
          }}
        >
          {selectedAnnouncement}
        </div>
      )}
    </div>
  );
};

export default AnnouncementComponent;
