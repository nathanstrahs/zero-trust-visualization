import React, { useEffect, useRef } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { getControlCountByBaseline } from '@/utils/helpers';
import { Control } from '@/types';

// Register the necessary components for a Pie chart with Chart.js
Chart.register(ArcElement, Tooltip, Legend, PieController);

interface BaselineDistributionChartProps {
  controls: Control[];
}

const BaselineDistributionChart: React.FC<BaselineDistributionChartProps> = ({ controls }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null); // Ref to hold the chart instance

  useEffect(() => {
    if (!chartRef.current) return;

    const baselineCounts = getControlCountByBaseline(controls);
  
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

    const options = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
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
        type: 'pie',
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
  }, [controls]); // Re-run effect when controls data changes

  return (
    <Box p={4}>
      <Heading size="md" mb={4} textAlign="center">
        Control Distribution by Baseline
      </Heading>
      <Box height="300px">
        <canvas ref={chartRef} />
      </Box>
    </Box>
  );
};

export default BaselineDistributionChart;