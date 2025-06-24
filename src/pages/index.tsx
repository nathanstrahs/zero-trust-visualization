import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Flex,
  Text,
  Tabs,
  NativeSelect,
  Icon,
  InputGroup,
  Input
} from '@chakra-ui/react';
import PillarCard from '@/components/PillarCard';
import ControlsTable from '@/components/ControlsTable';
import BaselineDistributionChart from '@/components/BaselineDistributionChart';
import PillarComplianceChart from '@/components/PillarComplianceChart';
import ComplianceOverviewCard from '@/components/ComplianceOverviewCard';
import OscalFileUpload from '@/components/OscalFileUpload';
import OscalDiffUploader from '@/components/OscalDiffUpload';
import BaselineComplianceChart from '@/components/BaselineComplianceChart';
import { getPillars, getBaselineLevels, getControlsByPillar, getControlsByBaseline } from '@/utils/helpers';
import { Control, ZeroTrustPillar, BaselineLevel } from '@/types';

export default function Home() {
  const [selectedPillar, setSelectedPillar] = useState<ZeroTrustPillar | null>(null);
  const [selectedBaseline, setSelectedBaseline] = useState<BaselineLevel | null>(null);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [processedControls, setProcessedControls] = useState<Control[]>([]);

  const pillars = getPillars();
  const baselineLevels = getBaselineLevels();
  
  const handlePillarClick = (pillar: ZeroTrustPillar) => {
    setSelectedPillar(pillar);
  };
  
  const handleBaselineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BaselineLevel;
    setSelectedBaseline(value);
  };

  const handleControlsProcessed = (newControls: Control[]) => {
    setProcessedControls(newControls);
    // Optionally, reset filters or perform other actions when new controls are loaded
    setSelectedPillar(null);
    setSelectedBaseline(null);
    setSelectedControlId('');
  };
  
  const getDisplayedControls = () => {
    // If no filters are selected return nothing
    if (!selectedPillar && !selectedBaseline && !selectedControlId) {
      return [];
    }
    // Start with the full list of controls
    let filteredControls = processedControls;
    if (selectedPillar) {
      filteredControls = getControlsByPillar(selectedPillar, filteredControls);
    }
    if (selectedBaseline) {
      filteredControls = getControlsByBaseline(selectedBaseline, filteredControls);
    }
    if (selectedControlId) {
      filteredControls = filteredControls.filter(control => 
        control.id.toLowerCase().includes(selectedControlId.toLowerCase())
      );
    }
    return filteredControls;
  };
  
  const getTableTitle = () => {
    if (selectedPillar && !selectedBaseline && !selectedControlId) {
      return `${selectedPillar} Pillar Controls`;
    }
    if (!selectedPillar && selectedBaseline && !selectedControlId) {
      return `${selectedBaseline.charAt(0).toUpperCase() + selectedBaseline.slice(1)} Baseline Controls`;
    }
    if (!selectedPillar && !selectedBaseline && selectedControlId) {
      return `Controls matching "${selectedControlId}"`;
    }
    if (selectedPillar && selectedBaseline && !selectedControlId) {
      return `${selectedBaseline.charAt(0).toUpperCase() + selectedBaseline.slice(1)} Baseline and ${selectedPillar} Pillar Controls`;
    }
    if (selectedPillar && !selectedBaseline && selectedControlId) {
      return `${selectedPillar} Pillar Controls matching "${selectedControlId}"`;
    }
    if (!selectedPillar && selectedBaseline && selectedControlId) {
      return `${selectedBaseline.charAt(0).toUpperCase() + selectedBaseline.slice(1)} Baseline Controls matching "${selectedControlId}"`;
    }
    if (selectedPillar && selectedBaseline && selectedControlId) {
      return `${selectedBaseline.charAt(0).toUpperCase() + selectedBaseline.slice(1)} Baseline and ${selectedPillar} Pillar Controls matching "${selectedControlId}"`;
    }
    return 'Please Select Baseline/Pillar or Search Control ID';
  };

  return (
    <Container maxW="full" py={8} px={{ base: 4, md: 6 }}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Zero Trust Framework Visualization
      </Heading>
      
      <Tabs.Root lazyMount fitted defaultValue="Dashboard">

        <Tabs.List>
          <Tabs.Trigger value="Dashboard">Dashboard</Tabs.Trigger>
          <Tabs.Trigger value="Controls">Controls</Tabs.Trigger>
          <Tabs.Trigger value="Diff">Diff</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="Dashboard">
          <Box mb={8}>
            <OscalFileUpload onControlsProcessed ={handleControlsProcessed} />
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} mb={6}>
            <ComplianceOverviewCard controls={processedControls} />
            <BaselineDistributionChart controls={processedControls} />
          </SimpleGrid>
          
          
          <Box mb={4}>
            <PillarComplianceChart controls={processedControls}/>
          </Box>

          <Box mb={4}>
            <BaselineComplianceChart controls={processedControls}/>
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
          <Flex direction={{ base: 'column', md: 'row' }} mb={4} gap={3}>
            <Box flex="1">
              
              <Text mb={3} mt={3} fontWeight="medium">Filter by Baseline:</Text>
              <NativeSelect.Root size="lg" >
                <NativeSelect.Field 
                  textAlign='center'
                  placeholder='Select Baseline'
                  value={selectedBaseline || ''}
                  onChange={ handleBaselineChange }
                >
                  {baselineLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator/>
              </NativeSelect.Root>
            </Box>
            
            <Box flex="1">
              <Text mb={3} mt={3} fontWeight="medium">Filter by Pillar:</Text>
              <NativeSelect.Root size="lg">
                <NativeSelect.Field 
                  textAlign='center'
                  placeholder='Select Pillar'
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
                </NativeSelect.Field>
                <NativeSelect.Indicator/>
              </NativeSelect.Root>
            </Box>
            <Box flex="1">
              <Text mb={3} mt={3} fontWeight="medium">Search by Control ID:</Text>
              <Input
                size="lg"
                textAlign='center'
                placeholder="Enter Control ID to search"
                value={selectedControlId}
                onChange={(e) => setSelectedControlId(e.target.value)}
              />
            </Box>
          </Flex>
          <Box>
            <ControlsTable 
            controls={getDisplayedControls()} 
            title={getTableTitle()} 
            />
          </Box>
        </Tabs.Content>
        <Tabs.Content value="Diff">
          
            <OscalDiffUploader />

        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
