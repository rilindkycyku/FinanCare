import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const ChartComponent = ({ chartType, chartData, chartOptions }) => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
      {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
    </div>
  );
};

export default ChartComponent;
