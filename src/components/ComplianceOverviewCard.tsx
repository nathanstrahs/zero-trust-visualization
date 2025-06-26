import React from 'react';
import { Box, Flex, Progress, Stat } from '@chakra-ui/react';
import { getPassingPercentageOverall, getMaxPercentagePillar, getMinPercentagePillar, getPillars, getPassingPercentageByPillar, getListofTiedPillars } from '@/utils/helpers';
import { Control } from '@/types';
import { useApplicable } from '@/contexts/ExpansionContext';

interface ComplianceOverviewCardProps {
  controls: Control[];
}

const ComplianceOverviewCard: React.FC<ComplianceOverviewCardProps> = ({ controls }) => {
  const { showIsApplicable } = useApplicable();
  const overallPercentage = getPassingPercentageOverall(controls, showIsApplicable);
  const pillars = getPillars();
  const maxPercentagePillar = getMaxPercentagePillar(controls, showIsApplicable);
  const maxPillar = pillars[maxPercentagePillar];
  const maxPercentagePillarVal = getPassingPercentageByPillar(maxPillar, controls, showIsApplicable);
  const tiedMaxPillars = getListofTiedPillars(maxPercentagePillarVal, controls, showIsApplicable);
  const minPercentagePillar = getMinPercentagePillar(controls, showIsApplicable);
  const minPillar = pillars[minPercentagePillar];
  const minPercentagePillarVal = getPassingPercentageByPillar(minPillar, controls, showIsApplicable);
  const tiedMinPillars = getListofTiedPillars(minPercentagePillarVal, controls, showIsApplicable);
  
  
  const getColorScheme = (val: number) => {
    if (val >= 80) return 'green';
    if (val >= 50) return 'yellow';
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
                colorPalette={getColorScheme(overallPercentage)}
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
                colorPalette={getColorScheme(maxPercentagePillarVal)}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <Stat.HelpText>
          {maxPercentagePillarVal >= 80 
            ? 'Good standing' 
            : maxPercentagePillarVal >= 50 
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
                colorPalette={getColorScheme(minPercentagePillarVal)}
                borderRadius="md"
              />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <Stat.HelpText>
          {minPercentagePillarVal >= 80 
            ? 'Good standing' 
            : minPercentagePillarVal >= 50 
              ? 'Needs improvement' 
              : 'Critical attention required'}
        </Stat.HelpText>
      </Stat.Root>
    </Box>
  );
};

export default ComplianceOverviewCard;
