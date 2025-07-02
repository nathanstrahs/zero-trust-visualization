import React, { useState } from 'react';
import {
  Badge,
  Box,
  Text,
  Heading,
  Table,
  Flex,
  Button,
  Checkbox
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
      />
    </Box>
  );
};

export default ControlsTable;
