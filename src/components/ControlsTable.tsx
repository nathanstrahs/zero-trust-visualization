import React from 'react';
import {
  Badge,
  Box,
  Text,
  Heading,
  Table,
} from '@chakra-ui/react';
import { Control, BaselineLevel } from '@/types';

interface ControlsTableProps {
  controls: Control[];
  title?: string;
}

const ControlsTable: React.FC<ControlsTableProps> = ({ controls, title }) => {
  const getStatusColor = (status: Control['status']) => {
    switch (status) {
      case 'passing':
        return "green";
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
        <Table.Root size="sm" striped>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Pillar</Table.ColumnHeader>
              <Table.ColumnHeader>Baseline</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {controls.map((control) => (
              <Table.Row key={control.id}>
                <Table.Cell>{control.id}</Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{control.name}</Text>
                  <Text fontSize="sm" color="gray.600">{control.description}</Text>
                </Table.Cell>
                <Table.Cell>{control.pillars.join(', ')}</Table.Cell>
                <Table.Cell><Badge colorPalette={getBaselineColor(control.baseline)}>{control.baseline}</Badge></Table.Cell>
                <Table.Cell><Badge colorPalette={getStatusColor(control.status)}>{control.status}</Badge></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};

export default ControlsTable;
