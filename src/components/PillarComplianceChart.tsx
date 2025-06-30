import React, { useEffect, useRef } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPillars, getPassingPercentageByPillar, getPillarStats } from '@/utils/helpers';
import { Control } from '@/types';
import { useApplicable } from '@/contexts/ExpansionContext';

// Register the necessary components for a Bar chart with Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

interface PillarComplianceChartProps {
  controls: Control[];
}

const PillarComplianceChart: React.FC<PillarComplianceChartProps> = ({ controls }) => {
  const { showIsApplicable } = useApplicable();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null); // Ref to hold the chart instance

  useEffect(() => {
    if (!chartRef.current) return;

    const pillars = getPillars();
    const percentages = pillars.map(pillar => getPassingPercentageByPillar(pillar, controls, showIsApplicable));
    
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

    const options = {
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
            label: function(context: any) {
              const pillar = pillars[context.dataIndex];
              const [passingCount, totalCount] = getPillarStats(pillar, controls, showIsApplicable);
              const percentage = context.raw as number;
              
              return `Passing: ${percentage.toFixed(1)}% (${passingCount}/${totalCount})`;
            }
          }
        }
      }
    };

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      // Destroy any existing chart instance before creating a new one
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create the new chart instance
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar', // Specify the chart type
        data: data,
        options: options,
      });
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [controls, showIsApplicable]); // Re-run the effect if the controls data or expansion state changes

  return (
    <Box p={4}>
      <Heading size="md" mb={4} textAlign="center">
        Compliance by Zero Trust Pillar
      </Heading>
      <Box height="300px">
        <canvas ref={chartRef} />
      </Box>
    </Box>
  );
};

export default PillarComplianceChart;