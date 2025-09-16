import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  VStack,
  useDisclosure,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { GoalForm } from '../components/GoalForm';
import { GoalList } from '../components/GoalList';
import type { Goal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

export const Dashboard: React.FC = () => {
  const [myGoals, setMyGoals] = useState<Goal[]>([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const disclosure = useDisclosure();
  const { isOpen, onOpen, onClose } = disclosure;
  const { user, logout } = useAuth();

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userGoals, allGoalsData] = await Promise.all([
        apiService.getGoalsByUser(user.id),
        apiService.getGoals()
      ]);
      
      setMyGoals(userGoals);
      setAllGoals(allGoalsData.filter(goal => goal.ownerId !== user.id));
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = (newGoal: Goal) => {
    setMyGoals(prev => [newGoal, ...prev]);
  };

  const handleMyGoalUpdate = (updatedGoal: Goal) => {
    setMyGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
  };

  const handleMyGoalDelete = (goalId: string) => {
    setMyGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleAllGoalUpdate = (updatedGoal: Goal) => {
    setAllGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
  };

  const handleAllGoalDelete = (goalId: string) => {
    setAllGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Creador de Objetivos</Heading>
            <Text color="gray.600">Bienvenido, {user?.username}</Text>
          </VStack>
          <HStack>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
              Nuevo Objetivo
            </Button>
            <Button variant="outline" onClick={logout}>
              Cerrar Sesión
            </Button>
          </HStack>
        </HStack>

        {/* Tabs for different views */}
        <Tabs>
          <TabList>
            <Tab>Mis Objetivos ({myGoals.length})</Tab>
            <Tab>Todos los Objetivos ({allGoals.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Mis Objetivos</Heading>
                {myGoals.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500" mb={4}>
                      No tienes objetivos creados aún
                    </Text>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
                      Crear tu primer objetivo
                    </Button>
                  </Box>
                ) : (
                  <GoalList
                    goals={myGoals}
                    onGoalUpdate={handleMyGoalUpdate}
                    onGoalDelete={handleMyGoalDelete}
                    showOwner={false}
                  />
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Objetivos de Otros Usuarios</Heading>
                {allGoals.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      No hay objetivos de otros usuarios para mostrar
                    </Text>
                  </Box>
                ) : (
                  <GoalList
                    goals={allGoals}
                    onGoalUpdate={handleAllGoalUpdate}
                    onGoalDelete={handleAllGoalDelete}
                    showOwner={true}
                  />
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Goal Creation Modal */}
      <GoalForm
        isOpen={isOpen}
        onClose={onClose}
        onGoalCreated={handleGoalCreated}
      />
    </Container>
  );
};