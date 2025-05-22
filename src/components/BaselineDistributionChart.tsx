import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getControlCountByBaseline } from '@/utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

const BaselineDistributionChart: React.FC = () => {
  const baselineCounts = getControlCountByBaseline();
  
  const data = {
    labels: ['High', 'Moderate', 'Low', 'None'],
    datasets: [
      {
        data: [
          baselineCounts.high,
          baselineCounts.moderate,
          baselineCounts.low,
          baselineCounts.none,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(201, 203, 207)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4} textAlign="center">
        Control Distribution by Baseline
      </Heading>
      <Box height="300px">
        <Pie 
          data={data} 
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default BaselineDistributionChart;
