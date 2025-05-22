import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Text,
  Heading,
} from '@chakra-ui/react';
import { Control, BaselineLevel, ZeroTrustPillar } from '@/types';

interface ControlsTableProps {
  controls: Control[];
  title?: string;
}

const ControlsTable: React.FC<ControlsTableProps> = ({ controls, title }) => {
  const getStatusColor = (status: Control['status']) => {
    switch (status) {
      case 'passing':
        return 'green';
      case 'failing':
        return 'red';
      case 'not-applicable':
        return 'gray';
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

  return (
    <Box overflowX="auto">
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      {controls.length === 0 ? (
        <Text>No controls found.</Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Pillar</Th>
              <Th>Baseline</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {controls.map((control) => (
              <Tr key={control.id}>
                <Td>{control.id}</Td>
                <Td>
                  <Text fontWeight="medium">{control.name}</Text>
                  <Text fontSize="sm" color="gray.600">{control.description}</Text>
                </Td>
                <Td>{control.pillar}</Td>
                <Td>
                  <Badge colorScheme={getBaselineColor(control.baseline)}>
                    {control.baseline}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(control.status)}>
                    {control.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ControlsTable;
