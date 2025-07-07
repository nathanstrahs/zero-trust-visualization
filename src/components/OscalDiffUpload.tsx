import React, { useState, useEffect, useMemo } from 'react';
import { getPillarsForKey } from '@/utils/map_pillars';
import { getBaselineForKey } from '@/utils/BaselineLookup';
import { extractNistControlStatuses } from '@/utils/oscalParser';
import { Control, ZeroTrustPillar } from '@/types';
import { MAX_FILE_SIZE_MB } from './OscalFileUpload';
import { toaster } from './ui/toaster';
import PillarDiffChart from './PillarDiffChart';
import { getPillars } from '@/utils/helpers';
import {
  Box,
  Button,
  Text,
  VStack,
  FileUpload,
  Heading,
  Alert,
  Flex,
  Table,
  Badge,
  Input,
  Checkbox,
  SimpleGrid,
  HStack,
  Separator
} from "@chakra-ui/react";

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB*1024*1024;

interface DiffResult{
    id: string;
    statusBefore: 'passing' | 'failing' | 'not-applicable';
    statusAfter: 'passing' | 'failing' | 'not-applicable';
    passingObsBefore: number;
    passingObsAfter: number;
    totalObsBefore: number;
    totalObsAfter: number;
}

const FileUploader = ({
    title,
    onFileUpload,
    fileName,
}: {
    title: string;
    onFileUpload: (file: File) => void;
    fileName: string;
}) => {
    return (
        <FileUpload.Root
        maxFiles={1}
        maxFileSize={MAX_FILE_SIZE_BYTES}
        onFileAccept={(details) => {
            if (details.files.length > 0) {
                onFileUpload(details.files[0]);
            }
        }}
        >
            <Box w={{ base: "full"}} p={4}>
                <FileUpload.Dropzone>
                    <VStack
                    border="2px"
                    borderColor="gray.300"
                    borderRadius="lg"
                    p={6}
                    textAlign="center"
                    w="full"
                    >
                        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2} _dark={{ color: "white" }}>
                            {title}
                        </Text>
                        <FileUpload.Trigger asChild>
                            <Button colorPalette="blue" fontWeight="bold">
                                Select File
                            </Button>
                        </FileUpload.Trigger>
                        {
                            fileName && (
                                <Text mt={3} fontSize="sm" color="gray.500" truncate _dark={{ color: "white" }}>
                                    File: {fileName}
                                </Text>
                            )
                        }
                    </VStack>
                </FileUpload.Dropzone>
                <FileUpload.HiddenInput accept='.json' />
            </Box>
        </FileUpload.Root>
    );
};

const mapControlToBaseline = (controlId: string): Control['baseline'] => {
    return getBaselineForKey(controlId);
};


const mapStatusToControlStatus = (status: string): Control['status'] => {
    if (status === 'pass') return 'passing';
    if (status === 'fail') return 'failing';
    return 'not-applicable';
};



const DiffTable = ({ diffs }: { diffs: DiffResult[] }) => {
    if (diffs.length === 0) {
        return <p className="text-center text-gray-500 mt-6">No status differences found between the two files.</p>;
    }
    const getStatusColor = (status: Control['status']) => {
    switch (status) {
      case 'passing':
        return "green";
      case 'failing':
        return 'red';
      case 'not-applicable':
        return 'blue';
      default:
        return 'gray';
    }
  };

    return (
    <Box mt={8}>
      <Heading as="h2" size="lg" textAlign="center" mb={4} color="gray.800" _dark={{ color: "white" }}>
        Control Status Changes
      </Heading>
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
        boxShadow="md"
        bg="white"
        overflowX="auto"
      >
        <Table.Root minW="full">
          <Table.Header bg="gray.100">
            <Table.Row>
              <Table.ColumnHeader p={3} fontWeight="semibold" textAlign="left">
                Control ID
              </Table.ColumnHeader>
              <Table.ColumnHeader p={3} fontWeight="semibold" textAlign="center">
                Status in Baseline File
              </Table.ColumnHeader>
              <Table.ColumnHeader p={3} fontWeight="semibold" textAlign="center">
                Status in Comparison File
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {diffs.map((diff, index) => (
              <Table.Row key={index} _hover={{ bg: 'gray.50' }}>
                <Table.Cell p={3}>
                  <Text fontSize="sm">
                    {diff.id}
                  </Text>
                </Table.Cell>
                <Table.Cell p={3} textAlign="center">
                  <Badge
                    colorPalette={getStatusColor(diff.statusBefore)}
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {diff.statusBefore} ({diff.passingObsBefore}/
                    {diff.totalObsBefore})
                  </Badge>
                </Table.Cell>
                <Table.Cell p={3} textAlign="center">
                  <Badge
                    colorPalette={getStatusColor(diff.statusAfter)}
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {diff.statusAfter} ({diff.passingObsAfter}/
                    {diff.totalObsAfter})
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};

const OscalDiffUploader = () => {
    const [controlsLeft, setControlsLeft] = useState<Control[]>([]);
    const [controlsRight, setControlsRight] = useState<Control[]>([]);
    const [fileNameLeft, setFileNameLeft] = useState<string>('');
    const [fileNameRight, setFileNameRight] = useState<string>('');
    const [diffResults, setDiffResults] = useState<DiffResult[]>([]);
    const [error, setError] = useState<string>('');
    
    // Filter states
    const [selectedPillars, setSelectedPillars] = useState<ZeroTrustPillar[]>(getPillars());
    const [controlSearchTerm, setControlSearchTerm] = useState<string>('');
    const [excludedControls, setExcludedControls] = useState<Set<string>>(new Set());
    
    const processFile = (file: File, setControls: (controls: Control[]) => void, setFileName: (name: string) => void) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        setFileName(file.name);
        setError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);
                const controlResults = extractNistControlStatuses(jsonData);

                if (controlResults.length === 0) {
                    setError(`No valid controls found in ${file.name}.`);
                    setControls([]);
                    return;
                }

                // Convert OSCAL control results to our Control type
                const mappedControls: Control[] = controlResults.map(result => {
                    const pillarsResult = getPillarsForKey(result.controlId);
                    const pillars = Array.isArray(pillarsResult) ? pillarsResult : [pillarsResult];
                    
                    // Normalize pillar names
                    const normalizedPillars = pillars.map(pillar => {
                        if (pillar === 'Network/Environment' || pillar === 'Network & Environment') 
                            return 'Network and Environment';
                        if (pillar === 'Application & Workload') 
                            return 'Application and Workload';
                        if (pillar === 'Visibility & Analytics') 
                            return 'Visibility and Analytics';
                        if (pillar === 'Automation & Orchestration') 
                            return 'Automation and Orchestration';
                        if (pillar === 'Enabler')
                            return 'Other';
                        return pillar;
                    });
                    
                    return {
                        id: result.controlId,
                        name: `NIST Control ${result.controlId}`,
                        description: result.details.join('; ') || 'No details available',
                        pillars: normalizedPillars as ZeroTrustPillar[],
                        baseline: mapControlToBaseline(result.controlId),
                        status: mapStatusToControlStatus(result.status),
                        totalObs: result.totalObs,
                        passingObs: result.passingObs,
                        allObservations: result.allObservations
                    };
                });
                setControls(mappedControls);
                    if (mappedControls.length == 0){
                      toaster.create({
                        title: 'Error finding controls',
                        description: `Found 0 controls in uploaded file`,
                        type: 'error',
                        duration: 5000,
                      });
                    } else { 
                      toaster.create({
                        title: 'File processed successfully',
                        description: `Found ${mappedControls.length} controls in the assessment results`,
                        type: 'success',
                        duration: 5000,
                      });
                    }
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    toaster.create({
                      title: 'Error processing file',
                      description: 'The file could not be processed. Please ensure it is a valid OSCAL JSON document.',
                      type: 'error',
                      duration: 5000,
                    });
                  }
        };
        
        reader.readAsText(file);
    };

    // Memoized filtered controls - only recalculate when dependencies actually change
    const filteredControlsLeft = useMemo(() => {
        return controlsLeft.filter(control => {
            // Check if control belongs to any selected pillar
            const pillarMatch = control.pillars.some(pillar => selectedPillars.includes(pillar));
            // Check if control is not excluded
            const notExcluded = !excludedControls.has(control.id);
            return pillarMatch && notExcluded;
        });
    }, [controlsLeft, selectedPillars, excludedControls]);

    const filteredControlsRight = useMemo(() => {
        return controlsRight.filter(control => {
            // Check if control belongs to any selected pillar
            const pillarMatch = control.pillars.some(pillar => selectedPillars.includes(pillar));
            // Check if control is not excluded
            const notExcluded = !excludedControls.has(control.id);
            return pillarMatch && notExcluded;
        });
    }, [controlsRight, selectedPillars, excludedControls]);

    // Get all unique controls for search (combining both datasets)
    const allControls = useMemo(() => {
        const combined = [...controlsLeft, ...controlsRight];
        const uniqueMap = new Map<string, Control>();
        combined.forEach(control => {
            if (!uniqueMap.has(control.id)) {
                uniqueMap.set(control.id, control);
            }
        });
        return Array.from(uniqueMap.values()).sort((a, b) => a.id.localeCompare(b.id));
    }, [controlsLeft, controlsRight]);

    // Filter controls for search results
    const searchResults = useMemo(() => {
        if (!controlSearchTerm.trim()) return [];
        return allControls.filter(control => 
            control.id.toLowerCase().includes(controlSearchTerm.toLowerCase()) ||
            control.name.toLowerCase().includes(controlSearchTerm.toLowerCase())
        ).slice(0, 10); // Limit to 10 results for performance
    }, [allControls, controlSearchTerm]);

    // Handle pillar toggle
    const handlePillarToggle = (pillar: ZeroTrustPillar) => {
        setSelectedPillars(prev => 
            prev.includes(pillar) 
                ? prev.filter(p => p !== pillar)
                : [...prev, pillar]
        );
    };

    // Handle control search
    const handleControlSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setControlSearchTerm(event.target.value);
    };

    // Handle control exclusion toggle
    const handleControlExclusionToggle = (controlId: string) => {
        setExcludedControls(prev => {
            const newSet = new Set(prev);
            if (newSet.has(controlId)) {
                newSet.delete(controlId);
            } else {
                newSet.add(controlId);
            }
            return newSet;
        });
        // Clear search after selecting/deselecting
        setControlSearchTerm('');
    };
    
    useEffect(() => {
        if (filteredControlsLeft.length > 0 && filteredControlsRight.length > 0) {
            const controlsLeftMap = new Map<string, Control>(filteredControlsLeft.map(c => [c.id, c]));
            const newDiffs: DiffResult[] = [];

            filteredControlsRight.forEach(controlRight => {
                const controlLeft = controlsLeftMap.get(controlRight.id);
                if (controlLeft && controlLeft.status !== controlRight.status) {
                    newDiffs.push({
                        id: controlRight.id,
                        statusBefore: controlLeft.status,
                        statusAfter: controlRight.status,
                        passingObsBefore: controlLeft.passingObs,
                        totalObsBefore: controlLeft.totalObs,
                        passingObsAfter: controlRight.passingObs,
                        totalObsAfter: controlRight.totalObs,
                    });
                }
            });
            setDiffResults(newDiffs);
        } else {
            setDiffResults([]);
        }
    }, [filteredControlsLeft, filteredControlsRight]);

    return (
    <Box p={6} minH="100vh">
      <Box maxW="7xl" mx="auto">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl" fontWeight="bold" color="gray.800" _dark={{ color: "white" }}>
            OSCAL Assessment Diff Tool
          </Heading>
          <Text color="gray.600" mt={2} _dark={{ color: "white" }}>
            Upload two OSCAL assessment-results files to see the differences in
            control statuses.
          </Text>
        </Box>

        {error && (
          <Alert.Root status="error" mb={6} borderRadius="lg">
            {error}
          </Alert.Root>
        )}

        <Flex direction={{ base: 'column', lg: 'row' }} mx={-4}>
          <FileUploader
            title="Baseline File"
            onFileUpload={(file) =>
              processFile(file, setControlsLeft, setFileNameLeft)
            }
            fileName={fileNameLeft}
          />
          <FileUploader
            title="Comparison File"
            onFileUpload={(file) =>
              processFile(file, setControlsRight, setFileNameRight)
            }
            fileName={fileNameRight}
          />
        </Flex>

        {controlsLeft.length > 0 && controlsRight.length > 0 && (
          <>
            {/* Filter Controls */}
            <Box mt={8} p={6} bg="gray.50" borderRadius="lg" _dark={{ bg: "gray.800" }}>
              <Heading as="h3" size="md" mb={4} color="gray.800" _dark={{ color: "white" }}>
                Filter Controls
              </Heading>
              <Separator mb={4} />
              
              {/* Pillar Checkboxes */}
              <Box mb={6}>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="semibold" color="gray.700" _dark={{ color: "gray.300" }}>
                    Select Zero Trust Pillars:
                  </Text>
                  <HStack gap={2}>

                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => setSelectedPillars(getPillars())}
                    >
                      Select All
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => setSelectedPillars([])}
                      colorPalette="gray"
                    >
                      Clear All
                    </Button>
                  </HStack>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
                  {getPillars().map(pillar => (
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
                      <Checkbox.Label fontSize="sm">{pillar}</Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Control Search and Exclusion */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="semibold" color="gray.700" _dark={{ color: "gray.300" }}>
                    Exclude Specific Controls:
                  </Text>
                  {excludedControls.size > 0 && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setExcludedControls(new Set())}
                      colorPalette="red"
                    >
                      Clear All Excluded ({excludedControls.size})
                    </Button>
                  )}
                </HStack>
                
                <VStack align="stretch" gap={3}>
                  <Input
                    placeholder="Search for controls to exclude (e.g., AC-1, AC-2)..."
                    value={controlSearchTerm}
                    onChange={handleControlSearchChange}
                    size="md"
                    bg="white"
                    _dark={{ bg: "gray.700" }}
                  />
                  
                  {searchResults.length > 0 && (
                    <Box 
                      maxH="200px" 
                      overflowY="auto" 
                      border="1px solid" 
                      borderColor="gray.200" 
                      borderRadius="md" 
                      bg="white"
                      _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                    >
                      {searchResults.map((control) => (
                        <Flex
                          key={control.id}
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: "gray.50", _dark: { bg: "gray.600" } }}
                          onClick={() => handleControlExclusionToggle(control.id)}
                          justify="space-between"
                          align="center"
                        >
                          <VStack align="start" gap={0} flex={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {control.id}
                            </Text>
                            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} truncate>
                              {control.name}
                            </Text>
                          </VStack>
                          <Badge
                            colorPalette={excludedControls.has(control.id) ? "red" : "gray"}
                            variant="outline"
                            size="sm"
                          >
                            {excludedControls.has(control.id) ? "Excluded" : "Exclude"}
                          </Badge>
                        </Flex>
                      ))}
                    </Box>
                  )}
                  
                  {excludedControls.size > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="red.600" _dark={{ color: "red.400" }}>
                        Excluded Controls ({excludedControls.size}):
                      </Text>
                      <Flex wrap="wrap" gap={1}>
                        {Array.from(excludedControls).map((controlId) => (
                          <Badge
                            key={controlId}
                            colorPalette="red"
                            variant="subtle"
                            cursor="pointer"
                            onClick={() => handleControlExclusionToggle(controlId)}
                            _hover={{ opacity: 0.8 }}
                          >
                            {controlId} ✕
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </VStack>
                
                <Text fontSize="xs" color="gray.500" mt={2} _dark={{ color: "gray.400" }}>
                  Showing {filteredControlsLeft.length} baseline controls and {filteredControlsRight.length} comparison controls
                  {excludedControls.size > 0 && ` (${excludedControls.size} excluded)`}
                </Text>
              </Box>
            </Box>

            {/* Chart and Table with filtered data */}
            {filteredControlsLeft.length > 0 && filteredControlsRight.length > 0 ? (
              <>
                <Box mt={8}>
                  <PillarDiffChart 
                    baselineControls={filteredControlsLeft}
                    comparisonControls={filteredControlsRight}
                    baselineFileName={fileNameLeft}
                    comparisonFileName={fileNameRight}
                    selectedPillars={selectedPillars}
                  />
                </Box>
                <DiffTable diffs={diffResults} />
              </>
            ) : (
              <Box mt={8} p={6} textAlign="center" bg="yellow.50" borderRadius="lg" _dark={{ bg: "yellow.900" }}>
                <Heading as="h3" size="md" mb={2} color="yellow.800" _dark={{ color: "yellow.200" }}>
                  No Controls Match Current Filters
                </Heading>
                <Text color="yellow.700" _dark={{ color: "yellow.300" }}>
                  Try adjusting your pillar selection or search term to see more results.
                  {selectedPillars.length === 0 && " You must select at least one pillar."}
                </Text>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};


export default OscalDiffUploader;