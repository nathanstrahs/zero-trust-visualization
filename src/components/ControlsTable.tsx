import React, { useState } from 'react';
import {
  Badge,
  Box,
  Text,
  Heading,
  Table,
  Flex,
  Button,
  Checkbox,
  HStack
} from '@chakra-ui/react';
import { Control, BaselineLevel } from '@/types';
import { useApplicable } from '@/contexts/ExpansionContext';
import ControlDetailModal from './ControlDetailModal';

interface ControlsTableProps {
  controls: Control[];
  title?: string;
  isExpandable?: boolean;
  initialRowCount?: number;
}

const ControlsTable: React.FC<ControlsTableProps> = ({ controls, title, isExpandable=false, initialRowCount=5 }) => {
  const { showIsApplicable, toggleApplicable } = useApplicable();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useRev4, setUseRev4] = useState(false);
  
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

  const getBaselineColor = (baseline: BaselineLevel) => {
    switch (baseline) {
      case 'high':
        return 'red';
      case 'moderate':
        return 'orange';
      case 'low':
        return 'yellow';
      case 'none':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const filteredControls = showIsApplicable ? controls: controls.filter(control => control.status !== 'not-applicable');

  const showExpansionButton = isExpandable && filteredControls.length > initialRowCount;
  const displayedControls = showExpansionButton && !isExpanded ? filteredControls.slice(0, initialRowCount) : filteredControls;

  const handleControlClick = (controlId: string) => {
    setSelectedControlId(controlId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedControlId('');
  };

  const expansionButton = showExpansionButton && (
    <Flex justify="center" mt={4}>
          <Button 
            variant="ghost" 
            colorScheme="blue"
            onClick={() => {
              console.log('ControlsTable button clicked! Current isExpanded:', isExpanded);
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Show Less' : `Show More (${filteredControls.length - initialRowCount} more)`}
          </Button>
        </Flex>
  );

  return (
   <Box overflowX="auto">
    <Flex justify="space-between" align="center" mb={4}>
        {title && <Heading size="md">{title}</Heading>}
        <HStack gap={4}>
          <HStack gap={2}>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
              Control Version:
            </Text>
            <Button
              size="sm"
              variant={useRev4 ? "solid" : "outline"}
              colorPalette="blue"
              onClick={() => setUseRev4(false)}
            >
              Rev 5
            </Button>
            <Button
              size="sm"
              variant={useRev4 ? "outline" : "solid"}
              colorPalette="blue"
              onClick={() => setUseRev4(true)}
            >
              Rev 4
            </Button>
          </HStack>
          <Checkbox.Root
            checked={showIsApplicable}
            onCheckedChange={toggleApplicable}
            colorPalette="blue"
            size='sm'
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Show Non-Applicable</Checkbox.Label> 
          </Checkbox.Root>
        </HStack>
      </Flex>
      
      {showExpansionButton && isExpanded && (
        <Flex justify="center" mb={4}>
          <Button 
            variant="ghost" 
            colorScheme="blue"
            onClick={() => setIsExpanded(false)}
          >
            Show Less
          </Button>
        </Flex>
      )}

      {filteredControls.length === 0 ? (
        <Text>No controls found.</Text>
      ) : (
        <Table.Root size="sm" interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Pillar</Table.ColumnHeader>
              <Table.ColumnHeader>Baseline</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Observations Passing</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {displayedControls.map((control) => (
              <Table.Row 
                key={control.id}
                cursor="pointer"
                _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                onClick={() => handleControlClick(control.id)}
              >
                <Table.Cell>{control.id}</Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{control.name}</Text>
                  <Text fontSize="sm" color="gray.600">{control.description}</Text>
                </Table.Cell>
                <Table.Cell>{control.pillars.join(', ')}</Table.Cell>
                <Table.Cell><Badge colorPalette={getBaselineColor(control.baseline)}>{control.baseline}</Badge></Table.Cell>
                <Table.Cell><Badge colorPalette={getStatusColor(control.status)}>{control.status}</Badge></Table.Cell>
                <Table.Cell><Text textAlign="center" marginLeft={-10}>{control.passingObs}/{control.totalObs}</Text></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      
      {/*expansion button at the bottom*/}
      {expansionButton}

      <ControlDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        controlId={selectedControlId}
        controls={controls}
        useRev4={useRev4}
      />
    </Box>
  );
};

export default ControlsTable;
