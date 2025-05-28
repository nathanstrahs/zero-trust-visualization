import React from 'react';
import { Box, Heading, Text, Progress, Badge, Flex, Spacer } from '@chakra-ui/react';
import { ZeroTrustPillar } from '@/types';
import { getControlsByPillar, getPassingPercentageByPillar } from '@/utils/helpers';
import { Control } from '@/types';

interface PillarCardProps {
  pillar: ZeroTrustPillar;
  onClick: () => void;
  controls: Control[];
}

const PillarCard: React.FC<PillarCardProps> = ({ pillar, onClick, controls }) => {
  const pillarSpecificControls = getControlsByPillar(pillar, controls);
  const passingPercentage = getPassingPercentageByPillar(pillar, controls);
  
  const getColorScheme = () => {
    if (passingPercentage >= 80) return 'green';
    if (passingPercentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <Box 
      p={5} 
      shadow="md" 
      borderWidth="1px" 
      borderRadius="md" 
      onClick={onClick}
      cursor="pointer"
      _hover={{ shadow: 'lg' }}
      transition="all 0.2s"
    >
      <Heading fontSize="xl" mb={2}>{pillar}</Heading>
      <Flex align="center" mb={2}>
        <Text>{pillarSpecificControls.length} Controls</Text>
        <Spacer />
        <Badge colorScheme={getColorScheme()}>
          {passingPercentage.toFixed(0)}% Passing
        </Badge>
      </Flex>
      <Progress 
        value={passingPercentage} 
        colorScheme={getColorScheme()} 
        size="sm" 
        borderRadius="md"
      />
    </Box>
  );
};

export default PillarCard;
