import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Flex,
  Text,
  Tabs
} from '@chakra-ui/react';
import { Select } from '@chakra-ui/select';
import { TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/tabs';
import PillarCard from '@/components/PillarCard';
import ControlsTable from '@/components/ControlsTable';
import BaselineDistributionChart from '@/components/BaselineDistributionChart';
import PillarComplianceChart from '@/components/PillarComplianceChart';
import ComplianceOverviewCard from '@/components/ComplianceOverviewCard';
import OscalFileUpload from '@/components/OscalFileUpload';
import { getPillars, getBaselineLevels, getControlsByPillar, getControlsByBaseline } from '@/utils/helpers';
import { Control, ZeroTrustPillar, BaselineLevel } from '@/types';
import Link from 'next/link';

export default function Home() {
  const [selectedPillar, setSelectedPillar] = useState<ZeroTrustPillar | null>(null);
  const [selectedBaseline, setSelectedBaseline] = useState<BaselineLevel | null>(null);
  const [processedControls, setProcessedControls] = useState<Control[]>([]);

  const pillars = getPillars();
  const baselineLevels = getBaselineLevels();
  
  const handlePillarClick = (pillar: ZeroTrustPillar) => {
    setSelectedPillar(pillar);
    setSelectedBaseline(null);
  };
  
  const handleBaselineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BaselineLevel;
    setSelectedBaseline(value);
    setSelectedPillar(null);
  };

  const handleControlsProcessed = (newControls: Control[]) => {
    setProcessedControls(newControls);
    // Optionally, reset filters or perform other actions when new controls are loaded
    setSelectedPillar(null);
    setSelectedBaseline(null);
  };
  
  const getDisplayedControls = () => {
    if (selectedPillar) {
      return getControlsByPillar(selectedPillar, processedControls);
    }
    if (selectedBaseline) {
      return getControlsByBaseline(selectedBaseline, processedControls);
    }
    return [];
  };
  
  const getTableTitle = () => {
    if (selectedPillar) {
      return `Controls for ${selectedPillar} Pillar`;
    }
    if (selectedBaseline) {
      return `${selectedBaseline.charAt(0).toUpperCase() + selectedBaseline.slice(1)} Baseline Controls`;
    }
    return '';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Zero Trust Framework Visualization
      </Heading>
      
      <Tabs.Root lazyMount unmountOnExit fitted defaultValue="Dashboard">

        <Tabs.List>
          <Tabs.Trigger value="Dashboard">Dashboard</Tabs.Trigger>
          <Tabs.Trigger value="Controls">Controls</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="Dashboard">
          <Box mb={8}>
            <OscalFileUpload onControlsProcessed ={handleControlsProcessed} />
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
            <ComplianceOverviewCard controls={processedControls} />
            <BaselineDistributionChart controls={processedControls} />
          </SimpleGrid>
          
          
          <Box mb={8}>
            <PillarComplianceChart controls={processedControls}/>
          </Box>
          
          <Heading size="md" mb={4}>
            Zero Trust Pillars
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
            {pillars.map((pillar) => (
              <PillarCard 
                key={pillar} 
                pillar={pillar} 
                onClick={() => handlePillarClick(pillar)}
                controls={processedControls} 
              />
            ))}
          </SimpleGrid>
        </Tabs.Content>
          
        <Tabs.Content value="Controls">
          <Flex direction={{ base: 'column', md: 'row' }} mb={6} gap={4}>
            <Box flex="1">
              <Text mb={2} fontWeight="medium">Filter by Baseline:</Text>
              <Select 
                placeholder="Select baseline" 
                value={selectedBaseline || ''} 
                onChange={handleBaselineChange}
              >
                {baselineLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </Select>
            </Box>
            
            <Box flex="1">
              <Text mb={2} fontWeight="medium">Selected Pillar:</Text>
              <Select 
                placeholder="Select pillar" 
                value={selectedPillar || ''} 
                onChange={(e) => {
                  const value = e.target.value as ZeroTrustPillar;
                  handlePillarClick(value);
                }}
              >
                {pillars.map((pillar) => (
                  <option key={pillar} value={pillar}>
                    {pillar}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          
          <ControlsTable 
            controls={getDisplayedControls()} 
            title={getTableTitle()} 
          />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
