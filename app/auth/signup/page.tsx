"use client";

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Link,
  Divider,
  useToast,
  Select,
  Radio,
  RadioGroup,
  Stack,
  HStack,
  Flex,
  chakra,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight, FiBriefcase, FiBookOpen } from 'react-icons/fi';
import NextLink from 'next/link';
import { useRouter } from "next/navigation";
import { motion, isValidMotionProp } from "framer-motion";
import { useAuth } from '../../../contexts/AuthContext';

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (p) => isValidMotionProp(p) || p === "children" || p === "style",
});

// ── Colour palette (matching landing page) ─────────────────────────────────
const C = {
  bg:          "#080B10",
  surface:     "#0E1219",
  surfaceHi:   "#141922",
  border:      "#1E2535",
  borderHi:    "#2D3A52",
  amber:       "#F5A623",
  amberGlow:   "rgba(245,166,35,0.15)",
  electric:    "#3CEFFF",
  electricDim: "rgba(60,239,255,0.1)",
  text:        "#F0F4FF",
  textMid:     "#8A93AB",
  textDim:     "#4A5268",
};

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher',
    grade: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    grade: false,
  });

  const toast = useToast();
  const router = useRouter();
  const { signup } = useAuth();

  const grades = [
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12', 'JEE Aspirant', 'NEET Aspirant'
  ];

  // Validation functions
  const validateName = (name: string) => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) return 'Invalid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateGrade = (grade: string) => {
    if (formData.role === 'student' && !grade) return 'Please select your grade';
    return '';
  };

  const nameError = touched.name ? validateName(formData.name) : '';
  const emailError = touched.email ? validateEmail(formData.email) : '';
  const passwordError = touched.password ? validatePassword(formData.password) : '';
  const gradeError = touched.grade && formData.role === 'student' ? validateGrade(formData.grade) : '';

  const isFormValid = () => {
    return (
      validateName(formData.name) === '' &&
      validateEmail(formData.email) === '' &&
      validatePassword(formData.password) === '' &&
      (formData.role !== 'student' || validateGrade(formData.grade) === '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      grade: true,
    });

    if (!isFormValid()) {
      toast({
        title: 'Please fix errors',
        description: 'Check all fields and try again',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup({
        ...formData,
        grade: formData.grade ? parseInt(formData.grade.replace(/\D/g, '') || '0', 10) : 0,
      });
      toast({
        title: 'Account created!',
        description: 'Welcome to QuizAI Platform',
        status: 'success',
        duration: 3000,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Failed to create account',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <Box
      minH="100vh"
      bg={C.bg}
      position="relative"
      overflow="hidden"
      fontFamily="'DM Sans', sans-serif"
    >
      {/* Global styles and noise overlay */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
          
          body::after {
            content: '';
            position: fixed;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            opacity: 0.028;
            pointer-events: none;
            z-index: 9998;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.45; transform: scale(1.7); }
          }
        `}
      </style>

      {/* Ambient glows */}
      <Box
        position="absolute"
        top="-180px"
        right="-80px"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(245,166,35,0.11) 0%, transparent 70%)"
        filter="blur(2px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="30%"
        left="-120px"
        w="480px"
        h="480px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(60,239,255,0.07) 0%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
      />

      <Container maxW="lg" minH="100vh" display="flex" alignItems="center" py={12}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          w="full"
        >
          <Box
            bg={C.surface}
            border={`1px solid ${C.border}`}
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(to right, ${C.amber}, transparent)`,
            }}
          >
            {/* Background glow effect */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="400px"
              h="400px"
              bg={C.amberGlow}
              filter="blur(60px)"
              borderRadius="full"
              pointerEvents="none"
              zIndex={0}
              opacity={0.3}
            />

            {/* Header */}
            <VStack spacing={4} mb={8} position="relative" zIndex={1}>
              {/* Logo */}
              <Flex
                w="48px"
                h="48px"
                bg={C.amber}
                borderRadius="12px"
                align="center"
                justify="center"
                mb={2}
              >
                <Text fontSize="24px" fontWeight="800" color={C.bg}>
                  Q
                </Text>
              </Flex>

              <Heading
                as="h1"
                fontFamily="'Playfair Display', serif"
                fontWeight="900"
                fontSize={{ base: "32px", md: "40px" }}
                letterSpacing="-1px"
                color={C.text}
                textAlign="center"
              >
                Create Account
              </Heading>

              <Text color={C.textMid} fontSize="15px" textAlign="center">
                Start your learning journey today
              </Text>

              {/* Live badge */}
              <HStack
                spacing={2}
                px="12px"
                py="6px"
                border={`1px solid ${C.border}`}
                borderRadius="full"
                bg={C.bg}
              >
                <Box
                  w="7px"
                  h="7px"
                  borderRadius="full"
                  bg="#34D399"
                  animation="pulse 2s ease-in-out infinite"
                />
                <Text
                  fontSize="10px"
                  color={C.textMid}
                  fontFamily="'DM Mono', monospace"
                  fontWeight="500"
                >
                  JOIN 12,400+ LEARNERS
                </Text>
              </HStack>
            </VStack>

            {/* Form */}
            <chakra.form onSubmit={handleSubmit} position="relative" zIndex={1}>
              <VStack spacing={5}>
                {/* Full Name Field */}
                <FormControl isInvalid={!!nameError}>
                  <FormLabel
                    fontSize="12px"
                    fontWeight="500"
                    color={C.textMid}
                    fontFamily="'DM Mono', monospace"
                    letterSpacing="0.08em"
                    mb={1}
                  >
                    FULL NAME
                  </FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onBlur={() => handleBlur('name')}
                      bg={C.bg}
                      border={`1px solid ${C.border}`}
                      _hover={{ borderColor: C.borderHi }}
                      _focus={{
                        borderColor: C.amber,
                        boxShadow: `0 0 0 1px ${C.amber}`,
                        bg: C.bg,
                      }}
                      color={C.text}
                      fontSize="14px"
                      py={6}
                      pl={10}
                    />
                    <InputRightElement
                      pointerEvents="none"
                      h="full"
                      alignItems="center"
                      justifyContent="center"
                      left={0}
                      position="absolute"
                      w="40px"
                    >
                      <FiUser color={C.textDim} size="16px" />
                    </InputRightElement>
                  </InputGroup>
                  {nameError && (
                    <Text fontSize="11px" mt={1} color="#F87171">
                      {nameError}
                    </Text>
                  )}
                </FormControl>

                {/* Email Field */}
                <FormControl isInvalid={!!emailError}>
                  <FormLabel
                    fontSize="12px"
                    fontWeight="500"
                    color={C.textMid}
                    fontFamily="'DM Mono', monospace"
                    letterSpacing="0.08em"
                    mb={1}
                  >
                    EMAIL ADDRESS
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => handleBlur('email')}
                      bg={C.bg}
                      border={`1px solid ${C.border}`}
                      _hover={{ borderColor: C.borderHi }}
                      _focus={{
                        borderColor: C.amber,
                        boxShadow: `0 0 0 1px ${C.amber}`,
                        bg: C.bg,
                      }}
                      color={C.text}
                      fontSize="14px"
                      py={6}
                      pl={10}
                    />
                    <InputRightElement
                      pointerEvents="none"
                      h="full"
                      alignItems="center"
                      justifyContent="center"
                      left={0}
                      position="absolute"
                      w="40px"
                    >
                      <FiMail color={C.textDim} size="16px" />
                    </InputRightElement>
                  </InputGroup>
                  {emailError && (
                    <Text fontSize="11px" mt={1} color="#F87171">
                      {emailError}
                    </Text>
                  )}
                </FormControl>

                {/* Password Field */}
                <FormControl isInvalid={!!passwordError}>
                  <FormLabel
                    fontSize="12px"
                    fontWeight="500"
                    color={C.textMid}
                    fontFamily="'DM Mono', monospace"
                    letterSpacing="0.08em"
                    mb={1}
                  >
                    PASSWORD
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onBlur={() => handleBlur('password')}
                      bg={C.bg}
                      border={`1px solid ${C.border}`}
                      _hover={{ borderColor: C.borderHi }}
                      _focus={{
                        borderColor: C.amber,
                        boxShadow: `0 0 0 1px ${C.amber}`,
                        bg: C.bg,
                      }}
                      color={C.text}
                      fontSize="14px"
                      py={6}
                      pl={10}
                    />
                    <InputRightElement
                      pointerEvents="none"
                      h="full"
                      alignItems="center"
                      justifyContent="center"
                      left={0}
                      position="absolute"
                      w="40px"
                    >
                      <FiLock color={C.textDim} size="16px" />
                    </InputRightElement>
                    <InputRightElement
                      h="full"
                      alignItems="center"
                      justifyContent="center"
                      right="12px"
                      width="auto"
                    >
                      <IconButton
                        aria-label="Toggle password visibility"
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        _hover={{ bg: "transparent", color: C.textMid }}
                        color={C.textDim}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {passwordError && (
                    <Text fontSize="11px" mt={1} color="#F87171">
                      {passwordError}
                    </Text>
                  )}
                </FormControl>

                {/* Role Selection */}
                <FormControl>
                  <FormLabel
                    fontSize="12px"
                    fontWeight="500"
                    color={C.textMid}
                    fontFamily="'DM Mono', monospace"
                    letterSpacing="0.08em"
                    mb={3}
                  >
                    I AM A
                  </FormLabel>
                  <RadioGroup
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value as 'student' | 'teacher' })}
                  >
                    <Stack direction="row" spacing={6}>
                      <Radio
                        value="student"
                        colorScheme="orange"
                        sx={{
                          "& .chakra-radio__control": {
                            borderColor: C.border,
                            bg: C.bg,
                            _checked: {
                              bg: C.amber,
                              borderColor: C.amber,
                            },
                          },
                        }}
                      >
                        <HStack spacing={2}>
                          <FiBookOpen size="14px" color={C.textMid} />
                          <Text color={C.text} fontSize="14px">Student</Text>
                        </HStack>
                      </Radio>
                      <Radio
                        value="teacher"
                        colorScheme="orange"
                        sx={{
                          "& .chakra-radio__control": {
                            borderColor: C.border,
                            bg: C.bg,
                            _checked: {
                              bg: C.amber,
                              borderColor: C.amber,
                            },
                          },
                        }}
                      >
                        <HStack spacing={2}>
                          <FiBriefcase size="14px" color={C.textMid} />
                          <Text color={C.text} fontSize="14px">Teacher</Text>
                        </HStack>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {/* Grade Selection (conditional) */}
                {formData.role === 'student' && (
                  <FormControl isInvalid={!!gradeError}>
                    <FormLabel
                      fontSize="12px"
                      fontWeight="500"
                      color={C.textMid}
                      fontFamily="'DM Mono', monospace"
                      letterSpacing="0.08em"
                      mb={1}
                    >
                      GRADE / LEVEL
                    </FormLabel>
                    <Select
                      placeholder="Select your grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      onBlur={() => handleBlur('grade')}
                      bg={C.bg}
                      border={`1px solid ${C.border}`}
                      _hover={{ borderColor: C.borderHi }}
                      _focus={{
                        borderColor: C.amber,
                        boxShadow: `0 0 0 1px ${C.amber}`,
                      }}
                      color={C.text}
                      fontSize="14px"
                      iconColor={C.textMid}
                    >
                      {grades.map((grade) => (
                        <option key={grade} value={grade} style={{ background: C.surface, color: C.text }}>
                          {grade}
                        </option>
                      ))}
                    </Select>
                    {gradeError && (
                      <Text fontSize="11px" mt={1} color="#F87171">
                        {gradeError}
                      </Text>
                    )}
                  </FormControl>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  w="full"
                  h="50px"
                  bg={C.amber}
                  color={C.bg}
                  fontSize="14px"
                  fontWeight="700"
                  fontFamily="'DM Sans', sans-serif"
                  borderRadius="10px"
                  rightIcon={<FiArrowRight />}
                  _hover={{
                    bg: "#F0B842",
                    transform: "translateY(-2px)",
                    boxShadow: `0 14px 35px -6px rgba(245,166,35,0.35)`,
                  }}
                  transition="all 0.2s"
                  mt={2}
                >
                  Sign Up
                </Button>
              </VStack>
            </chakra.form>

            {/* Divider */}
            <Box position="relative" mt={8} pt={4}>
              <Divider borderColor={C.border} />
            </Box>

            {/* Sign in link */}
            <Text textAlign="center" color={C.textMid} fontSize="13px">
              Already have an account?{' '}
              <Link
                as={NextLink}
                href="/auth/login"
                color={C.amber}
                fontWeight="600"
                _hover={{ color: "#F0B842", textDecoration: "none" }}
              >
                Sign in
              </Link>
            </Text>

            {/* Footer note */}
            <Text
              fontSize="10px"
              color={C.textDim}
              textAlign="center"
              fontFamily="'DM Mono', monospace"
              pt={2}
            >
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}