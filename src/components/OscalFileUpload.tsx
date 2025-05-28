import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  useToast,
  Heading
} from '@chakra-ui/react';
import { extractNistControlStatuses } from '../../oscalParser';
import { getPillarsForKey } from '../../map_pillars';
import { Control } from '@/types';
import ControlsTable from './ControlsTable';

interface OscalFileUploadProps {
  onControlsProcessed: (controls: Control[]) => void; // This will receive processedControls from the parent
}

const OscalFileUpload: React.FC<OscalFileUploadProps> = ({ onControlsProcessed }) => {
  const [controls, setControls] = useState<Control[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const toast = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const controlResults = extractNistControlStatuses(jsonData);
        
        // Convert OSCAL control results to our Control type
        const mappedControls: Control[] = controlResults.map(result => ({
          id: result.controlId,
          name: `NIST Control ${result.controlId}`,
          description: result.details.join('; ') || 'No details available',
          pillar: mapControlToPillar(result.controlId),
          baseline: mapControlToBaseline(result.controlId),
          status: mapStatusToControlStatus(result.status)
        }));
        
        setControls(mappedControls);

        if(onControlsProcessed) {
          onControlsProcessed(mappedControls);
        }
        
        toast({
          title: 'File processed successfully',
          description: `Found ${mappedControls.length} controls in the assessment results`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        toast({
          title: 'Error processing file',
          description: 'The file could not be processed. Please ensure it is a valid OSCAL JSON document.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Error reading file',
        description: 'There was an error reading the file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    };
    
    reader.readAsText(file);
  };

  // Simple mapping functions - these could be more sophisticated in a real app
  const mapControlToPillar = (controlId: string): Control['pillar'] => {
    // This is a simplified mapping - in a real app, you'd have a more accurate mapping
    const firstChar = controlId.charAt(0).toLowerCase();
    
    if (['a', 'b'].includes(firstChar)) return 'User';
    if (['c', 'd'].includes(firstChar)) return 'Device';
    if (['e', 'f'].includes(firstChar)) return 'Network/Environment';
    if (['g', 'h'].includes(firstChar)) return 'Application and Workload';
    if (['i', 'j'].includes(firstChar)) return 'Data';
    return 'Visibility and Analytics';
  };

  const mapControlToBaseline = (controlId: string): Control['baseline'] => {
    // This is a simplified mapping - in a real app, you'd have a more accurate mapping
    const num = parseInt(controlId.replace(/[^0-9]/g, '')) || 0;
    
    if (num > 15) return 'high';
    if (num > 10) return 'moderate';
    if (num > 5) return 'low';
    return 'none';
  };

  const mapStatusToControlStatus = (status: string): Control['status'] => {
    if (status === 'pass') return 'passing';
    if (status === 'fail') return 'failing';
    return 'not-applicable';
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading size="md">OSCAL Assessment Results Upload</Heading>
        
        <Box>
          <input
            type="file"
            accept=".json"
            id="oscal-file-upload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Button 
            as="label" 
            htmlFor="oscal-file-upload"
            colorScheme="blue"
            width="full"
          >
            Select OSCAL JSON File
          </Button>
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
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default OscalFileUpload;
