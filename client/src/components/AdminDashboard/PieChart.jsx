import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'], // Customize as needed
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
