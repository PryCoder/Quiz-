import {
    Box,
    Container,
    Stack,
    SimpleGrid,
    Text,
    Link,
    VStack,
    HStack,
    IconButton,
    Input,
    Button,
    Divider,
    useColorModeValue,
    Heading,
  } from '@chakra-ui/react';
  import {
    FiTwitter,
    FiGithub,
    FiLinkedin,
    FiMail,
    FiSend,
    FiHeart,
    FiMapPin,
    FiPhone,
    FiClock,
  } from 'react-icons/fi';
  import NextLink from 'next/link';
  
  export default function Footer() {
    const currentYear = new Date().getFullYear();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
  
    const quickLinks = [
      { label: 'About Us', href: '/about' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ];
  
    const supportLinks = [
      { label: 'Help Center', href: '/help' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'FAQ', href: '/faq' },
    ];
  
    const resourcesLinks = [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api-docs' },
      { label: 'Community', href: '/community' },
      { label: 'Status', href: '/status' },
    ];
  
    return (
      <Box
        as="footer"
        bg={bgColor}
        borderTop="1px"
        borderColor={borderColor}
        mt="auto"
      >
        {/* Newsletter Section */}
        <Box py={12} bg="primary.50">
          <Container maxW="container.xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} align="center">
              <VStack align="flex-start" spacing={3}>
                <Heading as="h3" size="lg" color="primary.700">
                  Stay Updated
                </Heading>
                <Text color="neutral.600">
                  Get the latest updates about new features and learning resources
                </Text>
              </VStack>
              
              <HStack spacing={4} as="form" onSubmit={(e) => e.preventDefault()}>
                <Input
                  placeholder="Enter your email"
                  size="lg"
                  bg="white"
                  borderRadius="full"
                  _focus={{
                    borderColor: 'primary.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                  }}
                />
                <Button
                  size="lg"
                  borderRadius="full"
                  variant="primary"
                  rightIcon={<FiSend />}
                  px={8}
                >
                  Subscribe
                </Button>
              </HStack>
            </SimpleGrid>
          </Container>
        </Box>
  
        <Container maxW="container.xl" py={12}>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 4 }}
            spacing={8}
            mb={8}
          >
            {/* Brand Column */}
            <VStack align="flex-start" spacing={4}>
              <HStack spacing={2}>
                <Box
                  as="img"
                  src="/images/logo.png"
                  alt="AI Quiz"
                  h={8}
                />
                <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, primary.500, accent.500)" bgClip="text">
                  AI Quiz
                </Text>
              </HStack>
              <Text fontSize="sm" color="neutral.600">
                Empowering education through AI-powered quizzes and adaptive learning.
              </Text>
              <HStack spacing={3}>
                <IconButton
                  aria-label="Twitter"
                  icon={<FiTwitter />}
                  variant="ghost"
                  colorScheme="twitter"
                  isRound
                />
                <IconButton
                  aria-label="GitHub"
                  icon={<FiGithub />}
                  variant="ghost"
                  colorScheme="gray"
                  isRound
                />
                <IconButton
                  aria-label="LinkedIn"
                  icon={<FiLinkedin />}
                  variant="ghost"
                  colorScheme="linkedin"
                  isRound
                />
                <IconButton
                  aria-label="Email"
                  icon={<FiMail />}
                  variant="ghost"
                  colorScheme="red"
                  isRound
                />
              </HStack>
            </VStack>
  
            {/* Quick Links */}
            <VStack align="flex-start" spacing={3}>
              <Text fontWeight="bold" fontSize="lg" color="neutral.700">
                Quick Links
              </Text>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  color="neutral.600"
                  _hover={{ color: 'primary.500' }}
                  transition="color 0.2s"
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
  
            {/* Support */}
            <VStack align="flex-start" spacing={3}>
              <Text fontWeight="bold" fontSize="lg" color="neutral.700">
                Support
              </Text>
              {supportLinks.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  color="neutral.600"
                  _hover={{ color: 'primary.500' }}
                  transition="color 0.2s"
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
  
            {/* Contact Info */}
            <VStack align="flex-start" spacing={3}>
              <Text fontWeight="bold" fontSize="lg" color="neutral.700">
                Contact Us
              </Text>
              <HStack spacing={2}>
                <FiMapPin color="gray.500" />
                <Text fontSize="sm" color="neutral.600">
                  123 Learning Street<br />
                  Education City, EC 12345
                </Text>
              </HStack>
              <HStack spacing={2}>
                <FiPhone color="gray.500" />
                <Text fontSize="sm" color="neutral.600">
                  +1 (555) 123-4567
                </Text>
              </HStack>
              <HStack spacing={2}>
                <FiMail color="gray.500" />
                <Text fontSize="sm" color="neutral.600">
                  support@aiquiz.com
                </Text>
              </HStack>
              <HStack spacing={2}>
                <FiClock color="gray.500" />
                <Text fontSize="sm" color="neutral.600">
                  Mon-Fri: 9AM - 6PM EST
                </Text>
              </HStack>
            </VStack>
          </SimpleGrid>
  
          <Divider my={6} />
  
          {/* Bottom Bar */}
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            spacing={4}
          >
            <Text fontSize="sm" color="neutral.500">
              © {currentYear} AI Quiz. All rights reserved. Made with{' '}
              <Box as="span" display="inline-block" color="red.500">
                <FiHeart size="12px" />
              </Box>{' '}
              for education
            </Text>
            
            <HStack spacing={6}>
              <Link
                as={NextLink}
                href="/privacy"
                fontSize="sm"
                color="neutral.500"
                _hover={{ color: 'primary.500' }}
              >
                Privacy
              </Link>
              <Link
                as={NextLink}
                href="/terms"
                fontSize="sm"
                color="neutral.500"
                _hover={{ color: 'primary.500' }}
              >
                Terms
              </Link>
              <Link
                as={NextLink}
                href="/cookies"
                fontSize="sm"
                color="neutral.500"
                _hover={{ color: 'primary.500' }}
              >
                Cookies
              </Link>
              <Link
                as={NextLink}
                href="/sitemap"
                fontSize="sm"
                color="neutral.500"
                _hover={{ color: 'primary.500' }}
              >
                Sitemap
              </Link>
            </HStack>
          </Stack>
        </Container>
      </Box>
    );
  }