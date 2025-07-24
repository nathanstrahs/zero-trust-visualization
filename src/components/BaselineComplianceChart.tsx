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
  Legend
} from 'chart.js';
import { getBaselineLevels, getPassingPercentageByBaseline, getBaselineStats, getPotentialPassingPercentageByBaseline } from '@/utils/helpers';
import { Control, Observation } from '@/types';
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

interface BaselineComplianceChartProps {
  controls: Control[];
  topFailingObservations?: Array<{ observation: Observation; failCount: number }>;
}


const BaselineComplianceChart: React.FC<BaselineComplianceChartProps> = ({ controls, topFailingObservations = [] }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null); // Ref to hold the chart instance
  const { showIsApplicable } = useApplicable();

  useEffect(() => {
    if (!chartRef.current) return;

    const baselines = getBaselineLevels();
    const percentages = baselines.map(baseline => getPassingPercentageByBaseline(baseline, controls, showIsApplicable));
    const potentialPercentages = topFailingObservations.length > 0 
      ? baselines.map(baseline => getPotentialPassingPercentageByBaseline(baseline, controls, showIsApplicable, topFailingObservations))
      : percentages;
    
    const datasets: any[] = [
      {
        label: 'Current Compliance',
        data: percentages,
        backgroundColor: percentages.map(percentage => {
          if (percentage >= 80) return 'rgba(180, 242, 121, 0.8)';
          if (percentage >= 50) return 'rgba(255, 205, 86, 0.8)';
          return 'rgba(255, 99, 132, 0.8)';
        }),
        borderColor: percentages.map(percentage => {
          if (percentage >= 80) return 'rgb(180, 242, 121)';
          if (percentage >= 50) return 'rgb(255, 205, 86)';
          return 'rgb(255, 99, 132)';
        }),
        borderWidth: 1,
        order: 2,
      }
    ];

    // Add potential compliance dataset only if we have top failing observations
    if (topFailingObservations.length > 0) {
      datasets.push({
        label: `Potential Compliance if Top ${topFailingObservations.length} Observations Pass`,
        data: potentialPercentages,
        backgroundColor: potentialPercentages.map(() => 'rgba(169, 169, 169, 0.4)'),
        borderColor: potentialPercentages.map(() => 'rgba(169, 169, 169, 0.8)'),
        borderWidth: 1,
        order: 1,
      });
    }

    const data = {
      labels: baselines.map(baseline => baseline.charAt(0).toUpperCase() + baseline.slice(1)),
      datasets: datasets,
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
          ticks: {
            stepSize: 20,
          }
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
          display: topFailingObservations.length > 0,
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const baseline = baselines[context.dataIndex];
              const [passingCount, totalCount] = getBaselineStats(baseline, controls, showIsApplicable);
              const percentage = context.raw as number;
              
              if (context.datasetIndex === 0) {
                return `Current: ${percentage.toFixed(1)}% (${passingCount}/${totalCount})`;
              } else {
                const improvement = percentage - percentages[context.dataIndex];
                return `Potential: ${percentage.toFixed(1)}% (+${improvement.toFixed(1)}%)`;
              }
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
  }, [controls, showIsApplicable, topFailingObservations]); // Re-run the effect if the controls data, expansion state, or top failing observations change

  return (
    <Box p={4}>
      <Heading size="md" mb={4} textAlign="center">
        Compliance by NIST Baseline
      </Heading>
      <Box height="220px">
        <canvas ref={chartRef} />
      </Box>
    </Box>
  );
};

export default BaselineComplianceChart;