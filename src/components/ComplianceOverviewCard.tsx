import React from 'react';
import { Box, Flex, Progress } from '@chakra-ui/react';
import { getPassingPercentageOverall, getMaxPercentagePillar, getMinPercentagePillar, getPillars, getPassingPercentageByPillar } from '@/utils/helpers';
import { Control } from '@/types';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/stat';

interface ComplianceOverviewCardProps {
  controls: Control[]; // This will receive processedControls from the parent
}

const ComplianceOverviewCard: React.FC<ComplianceOverviewCardProps> = ({ controls }) => {
  const overallPercentage = getPassingPercentageOverall(controls);
  const pillars = getPillars();
  const maxPercentagePillar = getMaxPercentagePillar(controls);
  const maxPillar = pillars[maxPercentagePillar];
  const maxPercentagePillarVal = getPassingPercentageByPillar(maxPillar, controls);
  const minPercentagePillar = getMinPercentagePillar(controls);
  const minPillar = pillars[minPercentagePillar];
  const minPercentagePillarVal = getPassingPercentageByPillar(minPillar, controls);
  
  
  const getColorScheme = () => {
    if (overallPercentage >= 80) return 'rgba(180, 242, 121, 0.6)';
    if (overallPercentage >= 50) return 'rgba(255, 205, 86, 0.6)';
    return 'rgba(255, 99, 132, 0.6)';
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Stat>
        <StatLabel fontSize="25">Overall Compliance</StatLabel>
        <Flex align="center" mt={2}>
          <StatNumber>{overallPercentage.toFixed(1)}%</StatNumber>
        </Flex>
        <Box mt={2}>
          <Progress.Root value={overallPercentage}>
            <Progress.Track bgSize="lg" borderRadius="md">
              <Progress.Range
                colorScheme={getColorScheme()}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <StatHelpText>
          {overallPercentage >= 80 
            ? 'Good standing' 
            : overallPercentage >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel fontSize="20">Max Compliance Pillar: {maxPillar}</StatLabel>
        <Flex align="center" mt={2}>
          <StatNumber>{maxPercentagePillarVal.toFixed(1)}%</StatNumber>
        </Flex>
        <Box mt={2}>
          <Progress.Root value={maxPercentagePillarVal}>
            <Progress.Track bgSize="lg" borderRadius="md">
              <Progress.Range
                colorScheme={getColorScheme()}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <StatHelpText>
          {overallPercentage >= 80 
            ? 'Good standing' 
            : overallPercentage >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel fontSize="20">Min Compliance Pillar: {minPillar}</StatLabel>
        <Flex align="center" mt={2}>
          <StatNumber>{minPercentagePillarVal.toFixed(1)}%</StatNumber>
        </Flex>
        <Box mt={2}>
          <Progress.Root value={minPercentagePillarVal}>
            <Progress.Track bgSize="lg" borderRadius="md">
              <Progress.Range
                colorScheme={getColorScheme()}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <StatHelpText>
          {overallPercentage >= 80 
            ? 'Good standing' 
            : overallPercentage >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </StatHelpText>
      </Stat>
    </Box>
  );
};

export default ComplianceOverviewCard;
