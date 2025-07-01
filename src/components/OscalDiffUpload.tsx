import React, { useState, useEffect } from 'react';
import { getPillarsForKey } from '@/utils/map_pillars';
import { getBaselineForKey } from '@/utils/BaselineLookup';
import { extractNistControlStatuses } from '@/utils/oscalParser';
import { Control, ZeroTrustPillar } from '@/types';
import { MAX_FILE_SIZE_MB } from './OscalFileUpload';
import { toaster } from './ui/toaster';
import PillarDiffChart from './PillarDiffChart';
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
  Badge
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
                        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
                            {title}
                        </Text>
                        <FileUpload.Trigger asChild>
                            <Button colorPalette="blue" fontWeight="bold">
                                Select File
                            </Button>
                        </FileUpload.Trigger>
                        {
                            fileName && (
                                <Text mt={3} fontSize="sm" color="gray.500" truncate>
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
      <Heading as="h2" size="lg" textAlign="center" mb={4} color="gray.800">
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
                        passingObs: result.passingObs
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
    
    useEffect(() => {
        if (controlsLeft.length > 0 && controlsRight.length > 0) {
            const controlsLeftMap = new Map<string, Control>(controlsLeft.map(c => [c.id, c]));
            const newDiffs: DiffResult[] = [];

            controlsRight.forEach(controlRight => {
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
    }, [controlsLeft, controlsRight]);

    return (
    <Box p={6} minH="100vh">
      <Box maxW="7xl" mx="auto">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl" fontWeight="bold" color="gray.800">
            OSCAL Assessment Diff Tool
          </Heading>
          <Text color="gray.600" mt={2}>
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
            <Box mt={8}>
              <PillarDiffChart 
                baselineControls={controlsLeft}
                comparisonControls={controlsRight}
                baselineFileName={fileNameLeft}
                comparisonFileName={fileNameRight}
              />
            </Box>
            <DiffTable diffs={diffResults} />
          </>
        )}
      </Box>
    </Box>
  );
};


export default OscalDiffUploader;