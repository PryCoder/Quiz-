"use client";
import {
    Box,
    Container,
    Flex,
    HStack,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Text,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    VStack,
    Badge,
  } from '@chakra-ui/react';
  import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
  import Link from 'next/link';
  import { useRouter } from "next/navigation";
  import { useAuth } from '../../contexts/AuthContext';
  
  export default function Navbar() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, logout } = useAuth();
    const router = useRouter();
  
    const NavLinks = [
      { href: '/', label: 'Home' },
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/about', label: 'About' },
    ];
  
    const handleLogout = async () => {
      await logout();
      router.push('/');
    };
  
    return (
      <Box
        position="sticky"
        top={0}
        zIndex={100}
        bg="white"
        borderBottom="1px"
        borderColor="neutral.200"
      >
        <Container maxW="container.xl">
          <Flex h={16} align="center" justify="space-between">
            {/* Logo */}
            <Link href="/">
              <Flex align="center" cursor="pointer">
                <Box
                  as="img"
                  src="/images/logo.png"
                  alt="Logo"
                  h={8}
                  mr={2}
                />
                <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, primary.500, accent.500)" bgClip="text">
                  AI Quiz
                </Text>
              </Flex>
            </Link>
  
            {/* Desktop Navigation */}
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              {NavLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Text
                    color={router.pathname === link.href ? 'primary.500' : 'neutral.600'}
                    fontWeight={router.pathname === link.href ? 'semibold' : 'normal'}
                    _hover={{ color: 'primary.500' }}
                    transition="color 0.2s"
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </HStack>
  
            {/* Right Section */}
            <HStack spacing={4}>
              {user ? (
                <>
                  <IconButton
                    aria-label="Notifications"
                    icon={<FiBell />}
                    variant="ghost"
                    position="relative"
                  >
                    <Badge
                      position="absolute"
                      top={0}
                      right={0}
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="xs"
                      px={1}
                    >
                      3
                    </Badge>
                  </IconButton>
  
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      leftIcon={
                        <Avatar
                          size="sm"
                          src={user.avatar || '/images/default-avatar.png'}
                          name={user.name}
                        />
                      }
                    >
                      <Text display={{ base: 'none', md: 'block' }}>
                        {user.name}
                      </Text>
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<FiUser />} onClick={() => router.push('/dashboard/profile')}>
                        Profile
                      </MenuItem>
                      <MenuItem icon={<FiSettings />} onClick={() => router.push('/dashboard/settings')}>
                        Settings
                      </MenuItem>
                      <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/login')}
                    display={{ base: 'none', md: 'flex' }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => router.push('/auth/signup')}
                    display={{ base: 'none', md: 'flex' }}
                  >
                    Get Started
                  </Button>
                </>
              )}
  
              {/* Mobile Menu Button */}
              <IconButton
                aria-label="Open menu"
                icon={<FiMenu />}
                variant="ghost"
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
              />
            </HStack>
          </Flex>
        </Container>
  
        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">
              <Flex align="center">
                <Box as="img" src="/images/logo.png" alt="Logo" h={6} mr={2} />
                <Text fontWeight="bold">AI Quiz</Text>
              </Flex>
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch">
                {NavLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Text
                      py={2}
                      onClick={onClose}
                      color={router.pathname === link.href ? 'primary.500' : 'neutral.600'}
                    >
                      {link.label}
                    </Text>
                  </Link>
                ))}
                {!user && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onClose();
                        router.push('/auth/login');
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        onClose();
                        router.push('/auth/signup');
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    );
  }