import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  Heading
} from '@chakra-ui/react';
import { extractNistControlStatuses } from '../utils/oscalParser';
import { getPillarsForKey } from '../utils/map_pillars';
import { Control, ZeroTrustPillar } from '@/types';
import ControlsTable from './ControlsTable';
import { toaster } from '@/components/ui/toaster';
import { getBaselineForKey } from '@/utils/BaselineLookup';

export const MAX_FILE_SIZE_MB = 100;

interface OscalFileUploadProps {
  onControlsProcessed: (controls: Control[]) => void; // This will receive processedControls from the parent
}

const OscalFileUpload: React.FC<OscalFileUploadProps> = ({ onControlsProcessed }) => {
  const [controls, setControls] = useState<Control[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || (file.size > MAX_FILE_SIZE_MB*1024*1024)) {
      console.error('Error with file upload');
        toaster.create({
          title: 'Error uploading file',
          description: `The file could not be processed. Please ensure it is a valid OSCAL JSON document smaller than ${ MAX_FILE_SIZE_MB } MB`,
          type: 'error',
          duration: 5000,
        });
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const controlResults = extractNistControlStatuses(jsonData);
        
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

        if(onControlsProcessed) {
          onControlsProcessed(mappedControls);
        }
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
    
    reader.onerror = () => {
      toaster.create({
        title: 'Error reading file',
        description: 'There was an error reading the file.',
        type: 'error',
        duration: 5000,
      });
    };
    
    reader.readAsText(file);
  };

  // Mapping functions for baseline and status

  const mapControlToBaseline = (controlId: string): Control['baseline'] => {
    return getBaselineForKey(controlId);
  };

  const mapStatusToControlStatus = (status: string): Control['status'] => {
    if (status === 'pass') return 'passing';
    if (status === 'fail') return 'failing';
    return 'not-applicable';
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <VStack gap={4} align="stretch">
        <Heading size="md">OSCAL Assessment Results Upload</Heading>
        
        <Box>
          <input
            type="file"
            accept=".json"
            id="oscal-file-upload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="oscal-file-upload">
            <Button 
              as="span" 
              colorPalette="blue"
              width="full"
              cursor="pointer"
            >
            Select OSCAL JSON File
          </Button>
          </label>
          
          {fileName && (
            <Text mt={2} fontSize="sm">
              Selected file: {fileName}
            </Text>
          )}
        </Box>
        
        {controls.length > 0 && (
          <Box mt={4}>
            <ControlsTable 
              controls={controls} 
              title="Controls from OSCAL Assessment Results"
              isExpandable={true}
              initialRowCount={5}

            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default OscalFileUpload;
