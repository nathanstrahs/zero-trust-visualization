import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController,
} from 'chart.js';
import { Box, Text } from '@chakra-ui/react';
import { Control, ZeroTrustPillar } from '@/types';
import { useColorMode } from './ui/color-mode';

// Register Chart.js components
ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PillarDiffChartProps {
  baselineControls: Control[];
  comparisonControls: Control[];
  baselineFileName?: string;
  comparisonFileName?: string;
  selectedPillars?: ZeroTrustPillar[];
}

const calculatePillarCompliance = (controls: Control[]): Map<ZeroTrustPillar, { compliance: number; total: number, passing: number }> => {
  const pillarStats = new Map<ZeroTrustPillar, { passing: number; total: number }>();
  
  controls.forEach(control => {
    control.pillars.forEach(pillar => {
      if (!pillarStats.has(pillar)) {
        pillarStats.set(pillar, { passing: 0, total: 0 });
      }
      
      const stats = pillarStats.get(pillar)!;
      stats.total += 1;
      
      // Calculate compliance based on status
      if (control.status === 'passing') {
        stats.passing += 1;
      } else if (control.status === 'failing') {
        stats.passing += 0;
      }
      // Note: not-applicable controls are not counted towards compliance calculation
    });
  });
  
  // Convert to compliance percentages and filter out not-applicables
  const complianceMap = new Map<ZeroTrustPillar, { compliance: number; total: number, passing: number }>();
  pillarStats.forEach((stats, pillar) => {
    const applicableTotal = controls
      .filter(c => c.pillars.includes(pillar) && c.status !== 'not-applicable')
      .length;
    
    const passing = stats.passing;
    const compliance = applicableTotal > 0 ? (stats.passing / applicableTotal) * 100 : 0;
    complianceMap.set(pillar, { compliance, total: applicableTotal, passing });
  });
  
  return complianceMap;
};

const PillarDiffChart: React.FC<PillarDiffChartProps> = ({
  baselineControls,
  comparisonControls,
  baselineFileName = 'Baseline',
  comparisonFileName = 'Comparison',
  selectedPillars
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { colorMode } = useColorMode(); // Get the current color mode

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate compliance data for both datasets
  const baselineCompliance = calculatePillarCompliance(baselineControls);
  const comparisonCompliance = calculatePillarCompliance(comparisonControls);
  
  // Get pillars to display - either selectedPillars or all unique pillars from datasets
  const allPillars = selectedPillars && selectedPillars.length > 0 
    ? selectedPillars.filter(pillar => 
        baselineCompliance.has(pillar) || comparisonCompliance.has(pillar)
      ).sort()
    : Array.from(new Set([
        ...baselineCompliance.keys(),
        ...comparisonCompliance.keys()
      ])).sort();

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    labels: allPillars,
    datasets: [
      {
        label: baselineFileName,
        data: allPillars.map(pillar => baselineCompliance.get(pillar)?.compliance || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: comparisonFileName,
        data: allPillars.map(pillar => comparisonCompliance.get(pillar)?.compliance || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      }
    ]
  }), [allPillars, baselineCompliance, comparisonCompliance, baselineFileName, comparisonFileName]);

  const options = useMemo(() => {
    // set grid line color based on theme
    const gridColor = colorMode === 'dark' ? 'gray' : 'rgba(0, 0, 0, 0.1)';
    const pointLabelColor = colorMode === 'dark' ? 'white' : 'black';
    const tickColor = colorMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            font: {
              size: 14,
            },
            color: pointLabelColor,
          },
        },
        title: {
          display: true,
          text: 'Compliance Comparison by Zero Trust Pillar',
          font: {
            size: 18,
            weight: 'bold' as const,
          },
          color: pointLabelColor,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const pillar = allPillars[context.dataIndex];
              const isBaseline = context.datasetIndex === 0;
              const complianceData = isBaseline
                ? baselineCompliance.get(pillar)
                : comparisonCompliance.get(pillar);

              const passing = complianceData?.passing || 0;
              const total = complianceData?.total || 0;
              const percentage = Number(context.formattedValue);
              const label = context.dataset.label;

              return `${label}: ${passing}/${total} (${percentage.toFixed(1)}%)`;
            },
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          angleLines: {
            display: true,
            color: gridColor,
          },
          grid: {
            color: gridColor,
          },
          pointLabels: {
            font: {
              size: 12,
              weight: 500,
            },
            color: pointLabelColor, 
          },
          ticks: {
            display: true,
            stepSize: 20,
            backdropColor: 'transparent',
            color: tickColor, 
            callback: function (value: any) {
              return value + '%';
            }
          },
        },
      },
    };
  }, [allPillars, baselineCompliance, comparisonCompliance, colorMode]);

  useEffect(() => {
    if (isClient && canvasRef.current && allPillars.length > 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new ChartJS(ctx, {
          type: 'radar',
          data: chartData,
          options: options,
        });
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [isClient, chartData, options]);

  if (baselineControls.length === 0 || comparisonControls.length === 0) {
    return (
      <Box textAlign="center" p={8}>
        <Text color="gray.500">
          Upload both baseline and comparison files to see the pillar compliance radar chart.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box height="500px" mb={6}>
        {isClient && <canvas ref={canvasRef} />}
      </Box>
    </Box>
  );
};

export default PillarDiffChart;
