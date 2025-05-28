import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPillars, getPassingPercentageByPillar } from '@/utils/helpers';
import { Control } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PillarComplianceChartProps {
  controls: Control[];
}

const PillarComplianceChart: React.FC<PillarComplianceChartProps> = ({ controls }) => {
  const pillars = getPillars();
  const percentages = pillars.map(pillar => getPassingPercentageByPillar(pillar, controls));
  
  const data = {
    labels: pillars,
    datasets: [
      {
        label: 'Compliance Percentage',
        data: percentages,
        backgroundColor: percentages.map(percentage => {
          if (percentage >= 80) return 'rgba(180, 242, 121, 0.6)';
          if (percentage >= 50) return 'rgba(255, 205, 86, 0.6)';
          return 'rgba(255, 99, 132, 0.6)';
	}),
        borderColor: percentages.map(percentage => {
          if (percentage >= 80) return 'rgb(180, 242, 121)';
          if (percentage >= 50) return 'rgb(255, 205, 86)';
          return 'rgb(255, 99, 132)';
        }),
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box p={4}>
      <Heading size="md" mb={4} textAlign="center">
        Compliance by Zero Trust Pillar
      </Heading>
      <Box height="300px">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Passing Percentage',
                },
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Passing: ${context.raw.toFixed(1)}%`;
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

export default PillarComplianceChart;
