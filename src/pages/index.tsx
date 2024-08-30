import DashboardCard01 from '../components/DashboardCard01'
import dynamic from 'next/dynamic';
import WorkInProgress from '../components/WorkInProgress';
const ChartSelector = dynamic(() => import('../components/DashboardCard01'), { ssr: false });

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to IO.Net Dashboard</h1>
      <ChartSelector />
    </div>
  );
};

export default HomePage;