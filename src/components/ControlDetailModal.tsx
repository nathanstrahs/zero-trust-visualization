import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Badge,
  Separator,
  Spinner,
  Alert
} from '@chakra-ui/react';
import { getControlDetail, ControlDetail, getControlDetailr4 } from '@/utils/excelParser';
import { Control } from '@/types';

interface ControlDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlId: string;
  controls: Control[];
  useRev4?: boolean;
}

const ControlDetailModal: React.FC<ControlDetailModalProps> = ({
  isOpen,
  onClose,
  controlId,
  controls,
  useRev4 = false
}) => {
  const [controlDetail, setControlDetail] = useState<ControlDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localControlData = controls?.find(control => control.id === controlId);

  useEffect(() => {
    if (isOpen && controlId) {
      setLoading(true);
      setError(null);
      setControlDetail(null);

      const getControlDetailFunction = useRev4 ? getControlDetailr4 : getControlDetail;
      const version = useRev4 ? "Rev 4" : "Rev 5";

      getControlDetailFunction(controlId)
        .then(detail => {
          setControlDetail(detail);
          if (!detail) {
            setError(`Control ${controlId} was not found in the official NIST ${version} Control Catalog.`);
          }
        })
        .catch(err => {
          setError(`Failed to load control details: ${err.message}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, controlId, useRev4]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement="center">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="4xl" maxH="80vh" overflowY="auto" p={6}>
          <Dialog.Header>
            <Dialog.Title>
              Control Details: {controlId} ({useRev4 ? "Rev 4" : "Rev 5"})
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            {loading && (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" />
                <Text mt={4}>Loading control details...</Text>
              </Box>
            )}
            {!loading && (
              <VStack align="stretch" gap={8}>
                {/* Display error as a notice, but don't prevent other content from rendering */}
                {error && (
                  <Alert.Root status="warning">
                    <Alert.Indicator />
                    <Alert.Title>Notice</Alert.Title>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Root>
                )}

                {controlDetail && (
                  <>
                    <Box>
                      <HStack mb={2}>
                        <Heading size="sm" color="blue.600">Control Identifier</Heading>
                        <Badge colorPalette="blue" variant="outline">
                          {controlDetail.identifier}
                        </Badge>
                      </HStack>
                      <Separator />
                    </Box>

                    <Box>
                      <Heading size="sm" color="green.600" mb={2}>Control Name</Heading>
                      <Text fontSize="md" fontWeight="medium">
                        {controlDetail.name}
                      </Text>
                      <Separator mt={3} />
                    </Box>

                    <Box>
                      <Heading size="sm" color="orange.600" mb={2}>Control Text</Heading>
                      <Box bg="gray.50" p={4} borderRadius="md" border="1px solid" borderColor="gray.200" _dark={{ bg: "gray.800", borderColor: "gray.600" }}>
                        <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.6">
                          {controlDetail.controlText}
                        </Text>
                      </Box>
                      <Separator mt={3} />
                    </Box>

                    <Box>
                      <Heading size="sm" color="purple.600" mb={2}>Discussion</Heading>
                      <Box bg="purple.50" p={4} borderRadius="md" border="1px solid" borderColor="purple.200" _dark={{ bg: "purple.900", borderColor: "purple.700" }}>
                        <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.6">
                          {controlDetail.discussion}
                        </Text>
                      </Box>
                      <Separator mt={3} />
                    </Box>

                    <Box>
                      <Heading size="sm" color="red.600" mb={2}>Related Controls</Heading>
                      <Box bg="red.50" p={4} borderRadius="md" border="1px solid" borderColor="red.200" _dark={{ bg: "red.900", borderColor: "red.700" }}>
                        <Text fontSize="sm" fontWeight="medium">
                          {controlDetail.relatedControls || 'None'}
                        </Text>
                      </Box>
                      <Separator mt={3} />
                    </Box>
                  </>
                )}
                {localControlData?.allObservations && localControlData.allObservations.length > 0 ? (
                  <Box>
                    <Heading size="md" color="black" mb={3} _dark={{ color: "white" }}>
                      Observation Details (Local Scan Information)
                    </Heading>
                    <VStack align="stretch" mt={3}>
                      {localControlData.allObservations.map((observation) => (
                        <Box key={observation.uuid} borderWidth="1px" borderRadius="md" p={4} bg="gray.50" _dark={{ bg: "gray.700" }}>
                          <Text fontSize="md" mb={1}>
                            <Text as="span" fontWeight="bold">Title:</Text> {observation.title}
                          </Text>
                          <Text mb={1}>
                            <Text as="span" fontWeight="bold">Result:</Text> {observation.result}
                          </Text>
                          <Text mb={1} fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                            <Text as="span" fontWeight="bold">UUID:</Text> {observation.uuid}
                          </Text>
                          <Text fontSize="sm">
                            <Text as="span" fontWeight="bold">Description:</Text> {observation.description}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <Text fontStyle="italic">No local scan information found for this control.</Text>
                )}
              </VStack>
            )}
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Box as="button" px={4} py={2} bg="gray.200" borderRadius="md" _hover={{ bg: "gray.300" }} _dark={{ bg: "gray.700", _hover: { bg: "gray.600" } }}>
                Close
              </Box>
            </Dialog.CloseTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default ControlDetailModal;