import React, { useState } from 'react';
import {
  Box,
  Badge,
  Container,
  Heading,
  SimpleGrid,
  Flex,
  Text,
  Tabs,
  Input,
  Checkbox,
  VStack,
  Button,
  Alert,
  HStack
} from '@chakra-ui/react';
import PillarCard from '@/components/PillarCard';
import ControlsTable from '@/components/ControlsTable';
import BaselineDistributionChart from '@/components/BaselineDistributionChart';
import PillarComplianceChart from '@/components/PillarComplianceChart';
import ComplianceOverviewCard from '@/components/ComplianceOverviewCard';
import OscalFileUpload from '@/components/OscalFileUpload';
import OscalDiffUploader from '@/components/OscalDiffUpload';
import BaselineComplianceChart from '@/components/BaselineComplianceChart';
import { getPillars, getBaselineLevels, getTopFailingObservations } from '@/utils/helpers';
import { Control, ZeroTrustPillar, BaselineLevel } from '@/types';

export default function Home() {
  const [selectedPillars, setSelectedPillars] = useState<ZeroTrustPillar[]>([]);
  const [selectedBaselines, setSelectedBaselines] = useState<BaselineLevel[]>([]);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [processedControls, setProcessedControls] = useState<Control[]>([]);
  const [selectedObservationCount, setSelectedObservationCount] = useState<number>(3);

  const pillars = getPillars();
  const baselineLevels = getBaselineLevels();
  
  const handlePillarToggle = (pillar: ZeroTrustPillar) => {
    setSelectedPillars(prev => 
      prev.includes(pillar) 
        ? prev.filter(p => p !== pillar)
        : [...prev, pillar]
    );
  };
  
  const handleBaselineToggle = (baseline: BaselineLevel) => {
    setSelectedBaselines(prev => 
      prev.includes(baseline) 
        ? prev.filter(b => b !== baseline)
        : [...prev, baseline]
    );
  };

  const handleControlsProcessed = (newControls: Control[]) => {
    setProcessedControls(newControls);
    // Optionally, reset filters or perform other actions when new controls are loaded
    setSelectedPillars([]);
    setSelectedBaselines([]);
    setSelectedControlId('');
  };
  
  const getDisplayedControls = () => {
    // If no filters are selected return nothing
    if (selectedPillars.length === 0 && selectedBaselines.length === 0 && !selectedControlId) {
      return [];
    }
    // Start with the full list of controls
    let filteredControls = processedControls;
    
    // Filter by selected pillars (AND logic - control must have all selected pillars)
    if (selectedPillars.length > 0) {
      filteredControls = filteredControls.filter(control => 
        selectedPillars.every(pillar => control.pillars.includes(pillar))
      );
    }
    
    // Filter by selected baselines (OR logic - control must match at least one selected baseline)
    if (selectedBaselines.length > 0) {
      filteredControls = filteredControls.filter(control => 
        selectedBaselines.includes(control.baseline)
      );
    }
    
    // Filter by control ID (if specified)
    if (selectedControlId) {
      filteredControls = filteredControls.filter(control => 
        control.id.toLowerCase().includes(selectedControlId.toLowerCase())
      );
    }
    return filteredControls;
  };
  
  const getTableTitle = () => {
    const titleParts: string[] = [];
    
    if (selectedPillars.length > 0) {
      if (selectedPillars.length === 1) {
        titleParts.push(`${selectedPillars[0]} Pillar`);
      } else {
        titleParts.push(`${selectedPillars.length} Pillars`);
      }
    }
    
    if (selectedBaselines.length > 0) {
      if (selectedBaselines.length === 1) {
        titleParts.push(`${selectedBaselines[0].charAt(0).toUpperCase() + selectedBaselines[0].slice(1)} Baseline`);
      } else {
        titleParts.push(`${selectedBaselines.length} Baselines`);
      }
    }
    
    if (selectedControlId) {
      titleParts.push(`matching "${selectedControlId}"`);
    }
    
    if (titleParts.length === 0) {
      return 'Please Select Baseline/Pillar or Search Control ID';
    }
    
    return titleParts.join(' and ') + ' Controls';
  };

  const topFailingObservations = getTopFailingObservations(processedControls, selectedObservationCount);

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
            <PillarComplianceChart controls={processedControls} topFailingObservations={topFailingObservations}/>
          </Box>

          <Box mb={4}>
            <BaselineComplianceChart controls={processedControls} topFailingObservations={topFailingObservations}/>
          </Box>
          
          <Heading size="md" mb={4}>
            Zero Trust Pillars
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
            {pillars.map((pillar) => (
              <PillarCard 
                key={pillar} 
                pillar={pillar} 
                onClick={() => handlePillarToggle(pillar)}
                controls={processedControls} 
              />
            ))}
          </SimpleGrid>
                     <Box mb={4} mt={10}>
             {topFailingObservations.length > 0 ? (
               <Box>
                 <HStack justify="space-between" align="center" mb={4}>
                   <Heading size="md" color="black" _dark={{ color: "white" }}>
                     Top {topFailingObservations.length} Most Failing Observations
                   </Heading>
                   <HStack gap={2}>
                     <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                       Show top:
                     </Text>
                     <select
                       value={selectedObservationCount}
                       onChange={(e) => setSelectedObservationCount(Number(e.target.value))}
                       style={{
                         fontSize: '14px',
                         width: '80px',
                         height: '32px',
                         backgroundColor: 'white',
                         border: '1px solid #E2E8F0',
                         borderRadius: '6px',
                         padding: '0 8px'
                       }}
                     >
                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                         <option key={num} value={num}>{num}</option>
                       ))}
                     </select>
                     <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                       observations
                     </Text>
                   </HStack>
                 </HStack>
                 <VStack gap={4} align="stretch">
                   {topFailingObservations.map((item, index) => (
                     <Box key={item.observation.uuid}>
                       <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600" _dark={{ color: "gray.400" }}>
                         #{index + 1} - Failed across {item.failCount} controls
                       </Text>
                       <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" _dark={{ bg: "gray.700" }}>
                         <Text fontSize="md" mb={1}>
                           <Text as="span" fontWeight="bold">Title:</Text> {item.observation.title}
                         </Text>
                         <Text mb={1}>
                           <Text as="span" fontWeight="bold">Result:</Text> {item.observation.result}
                         </Text>
                         <Text mb={1} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                           <Text as="span" fontWeight="bold">UUID:</Text> {item.observation.uuid}
                         </Text>
                         <Text fontSize="sm">
                           <Text as="span" fontWeight="bold">Description:</Text> {item.observation.description}
                         </Text>
                       </Box>
                     </Box>
                   ))}
                 </VStack>
               </Box>
             ) : (
              <Box
                p={6}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                bg="white"
                boxShadow="md"
                textAlign="center"
                _dark={{ 
                  bg: "gray.800", 
                  borderColor: "gray.600" 
                }}
              >
                <Heading size="lg" color="gray.800" mb={4} _dark={{ color: "white" }}>
                  Excellent Compliance
                </Heading>
                <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
                  No failing observations were found. Keep up the great work.
                </Text>
              </Box>
            )}
          </Box>

        </Tabs.Content>
          
        <Tabs.Content value="Controls">
          <Flex direction={{ base: 'column', lg: 'row' }} mb={4} gap={6}>
            <Box flex="1">
              <Text mb={3} mt={3} fontWeight="medium">Filter by Baseline:</Text>
                              <VStack align="start" gap={2}>
                  {baselineLevels.map((level) => (
                  <Checkbox.Root
                    key={level}
                    checked={selectedBaselines.includes(level)}
                    onCheckedChange={() => handleBaselineToggle(level)}
                    colorPalette="blue"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </VStack>
            </Box>
            
            <Box flex="1">
              <Text mb={3} mt={3} fontWeight="medium">Filter by Pillar:</Text>
                              <VStack align="start" gap={2}>
                  {pillars.map((pillar) => (
                  <Checkbox.Root
                    key={pillar}
                    checked={selectedPillars.includes(pillar)}
                    onCheckedChange={() => handlePillarToggle(pillar)}
                    colorPalette="blue"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>{pillar}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </VStack>
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
          
          {(selectedPillars.length > 0 || selectedBaselines.length > 0 || selectedControlId) && (
            <Flex justify="center" mb={4}>
              <Button
                variant="outline"
                colorPalette="gray"
                onClick={() => {
                  setSelectedPillars([]);
                  setSelectedBaselines([]);
                  setSelectedControlId('');
                }}
              >
                Clear All Filters
              </Button>
            </Flex>
          )}
          
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
