import React from 'react';
import {
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Checkbox,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import type { Goal } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface GoalListProps {
  goals: Goal[];
  onGoalUpdate: (updatedGoal: Goal) => void;
  onGoalDelete: (goalId: string) => void;
  showOwner?: boolean;
}

export const GoalList: React.FC<GoalListProps> = ({ 
  goals, 
  onGoalUpdate, 
  onGoalDelete, 
  showOwner = false 
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const handleToggleComplete = async (goal: Goal) => {
    try {
      const updatedGoal = await apiService.updateGoal(goal.id, {
        completed: !goal.completed
      });
      
      if (updatedGoal) {
        onGoalUpdate(updatedGoal);
        toast({
          title: 'Actualizado',
          description: `Objetivo ${updatedGoal.completed ? 'completado' : 'marcado como pendiente'}`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el objetivo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      const success = await apiService.deleteGoal(goalId);
      if (success) {
        onGoalDelete(goalId);
        toast({
          title: 'Eliminado',
          description: 'Objetivo eliminado correctamente',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el objetivo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityText = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (goals.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No hay objetivos para mostrar</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {goals.map((goal) => (
        <Box
          key={goal.id}
          p={4}
          borderWidth={1}
          borderRadius="md"
          bg={goal.completed ? 'gray.50' : 'white'}
          opacity={goal.completed ? 0.7 : 1}
        >
          <HStack justify="space-between" align="start">
            <VStack align="start" flex={1} spacing={2}>
              <HStack>
                <Checkbox
                  isChecked={goal.completed}
                  onChange={() => handleToggleComplete(goal)}
                  isDisabled={user?.id !== goal.ownerId}
                >
                  <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    textDecoration={goal.completed ? 'line-through' : 'none'}
                  >
                    {goal.title}
                  </Text>
                </Checkbox>
              </HStack>

              <Text color="gray.600">{goal.description}</Text>

              <HStack spacing={2} wrap="wrap">
                {showOwner && (
                  <Badge colorScheme="blue">
                    👤 {goal.owner}
                  </Badge>
                )}
                <Badge colorScheme={getPriorityColor(goal.priority)}>
                  🔥 {getPriorityText(goal.priority)}
                </Badge>
                <Badge colorScheme="purple">
                  📅 {formatDate(goal.dueDate)}
                </Badge>
                <Badge colorScheme="gray">
                  ➕ {formatDate(goal.createdAt)}
                </Badge>
              </HStack>
            </VStack>

            {user?.id === goal.ownerId && (
              <IconButton
                aria-label="Eliminar objetivo"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(goal.id)}
              />
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};