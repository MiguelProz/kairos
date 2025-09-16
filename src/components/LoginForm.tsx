import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const { login, register, loading } = useAuth();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const success = await login(loginData.username, loginData.password);
    
    if (success) {
      toast({
        title: 'Éxito',
        description: 'Has iniciado sesión correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Credenciales incorrectas. Usa cualquier usuario con contraseña "password"',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const success = await register(registerData.username, registerData.email, registerData.password);
    
    if (success) {
      toast({
        title: 'Éxito',
        description: 'Te has registrado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: 'El usuario o email ya existe',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <Heading textAlign="center" mb={6}>Creador de Objetivos</Heading>
      
      <Tabs>
        <TabList>
          <Tab>Iniciar Sesión</Tab>
          <Tab>Registrarse</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Usuario</FormLabel>
                  <Input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Ingresa tu usuario"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <Input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Ingresa tu contraseña"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                >
                  Iniciar Sesión
                </Button>
                
                <Text fontSize="sm" color="gray.600">
                  Demo: Usa cualquier usuario con contraseña "password"
                </Text>
              </VStack>
            </form>
          </TabPanel>

          <TabPanel>
            <form onSubmit={handleRegister}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Usuario</FormLabel>
                  <Input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="Elige un nombre de usuario"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="Ingresa tu email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Crea una contraseña"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  width="full"
                  isLoading={loading}
                >
                  Registrarse
                </Button>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};