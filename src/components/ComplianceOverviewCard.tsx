import React from 'react';
import { Box, Flex, Progress, Stat } from '@chakra-ui/react';
import { getPassingPercentageOverall, getMaxPercentagePillar, getMinPercentagePillar, getPillars, getPassingPercentageByPillar, getListofTiedPillars } from '@/utils/helpers';
import { Control } from '@/types';

interface ComplianceOverviewCardProps {
  controls: Control[];
}

const ComplianceOverviewCard: React.FC<ComplianceOverviewCardProps> = ({ controls }) => {
  const overallPercentage = getPassingPercentageOverall(controls);
  const pillars = getPillars();
  const maxPercentagePillar = getMaxPercentagePillar(controls);
  const maxPillar = pillars[maxPercentagePillar];
  const maxPercentagePillarVal = getPassingPercentageByPillar(maxPillar, controls);
  const tiedMaxPillars = getListofTiedPillars(maxPercentagePillarVal, controls);
  const minPercentagePillar = getMinPercentagePillar(controls);
  const minPillar = pillars[minPercentagePillar];
  const minPercentagePillarVal = getPassingPercentageByPillar(minPillar, controls);
  const tiedMinPillars = getListofTiedPillars(minPercentagePillarVal, controls);
  
  
  const getColorScheme = () => {
    if (overallPercentage >= 80) return 'green';
    if (overallPercentage >= 50) return 'yellow';
    return 'red';
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Stat.Root>
        <Stat.Label fontSize="lg"><b>Overall Compliance</b></Stat.Label>
        <Flex align="center">
          <Stat.ValueText>{overallPercentage.toFixed(1)}%</Stat.ValueText>
        </Flex>
        <Box mt={2}>
          <Progress.Root value={overallPercentage}>
            <Progress.Track bgSize="lg" borderRadius="md">
              <Progress.Range
                colorPalette={getColorScheme()}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <Stat.HelpText>
          {overallPercentage >= 80 
            ? 'Good standing' 
            : overallPercentage >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </Stat.HelpText>
      </Stat.Root>
      <Stat.Root>
        <Stat.Label fontSize="sm" marginTop={2}><b>Max Compliance Pillar(s):</b> {tiedMaxPillars.join(', ')}</Stat.Label>
        <Flex align="center">
          <Stat.ValueText>{maxPercentagePillarVal.toFixed(1)}%</Stat.ValueText>
        </Flex>
        <Box mt={2}>
          <Progress.Root value={maxPercentagePillarVal}>
            <Progress.Track bgSize="lg" borderRadius="md">
              <Progress.Range
                colorPalette={getColorScheme()}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <Stat.HelpText>
          {overallPercentage >= 80 
            ? 'Good standing' 
            : overallPercentage >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </Stat.HelpText>
      </Stat.Root>
      <Stat.Root>
        <Stat.Label fontSize="sm" marginTop={3}><b>Min Compliance Pillar(s): </b>{tiedMinPillars.join(', ')}</Stat.Label>
        <Flex align="center" mt={2}>
          <Stat.ValueText>{minPercentagePillarVal.toFixed(1)}%</Stat.ValueText>
        </Flex>
        <Box mt={2}>
          <Progress.Root value={minPercentagePillarVal}>
            <Progress.Track bgSize="lg" borderRadius="md">
              <Progress.Range
                colorPalette={getColorScheme()}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <Stat.HelpText>
          {overallPercentage >= 80 
            ? 'Good standing' 
            : overallPercentage >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </Stat.HelpText>
      </Stat.Root>
    </Box>
  );
};

export default ComplianceOverviewCard;
