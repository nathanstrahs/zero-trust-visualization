import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText, Flex, Progress } from '@chakra-ui/react';
import { getPassingPercentageOverall } from '@/utils/helpers';
import { Control, ZeroTrustPillar, BaselineLevel } from '@/types';
import { Control } from '@/types';

interface ComplianceOverviewCardProps {
  controls: Control[]; // This will receive processedControls from the parent
}

const ComplianceOverviewCard: React.FC<ComplianceOverviewCardProps> = ({ controls }) => {
  const overallPercentage = getPassingPercentageOverall(controls);
  
  const getColorScheme = () => {
    if (overallPercentage >= 80) return 'green';
    if (overallPercentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Stat>
        <StatLabel fontSize="lg">Overall Compliance</StatLabel>
        <Flex align="center" mt={2}>
          <StatNumber>{overallPercentage.toFixed(1)}%</StatNumber>
        </Flex>
        <Box mt={2}>
          <Progress 
            value={overallPercentage} 
            colorScheme={getColorScheme()} 
            size="lg" 
            borderRadius="md"
          />
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
