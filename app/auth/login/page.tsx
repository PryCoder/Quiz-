"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  VStack,
  chakra,
  useColorModeValue,
  Checkbox,
} from "@chakra-ui/react";
import { motion, isValidMotionProp } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

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

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const router = useRouter();
  const { login } = useAuth() as any;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      login(result.token, result.user);
      toast.success('Login successful!');

      // Redirect based on role
      if (result.user.role === 'admin') {
        router.push('/dashboard/admin/users');
      } else if (result.user.role === 'teacher') {
        router.push('/dashboard/teacher/channels');
      } else {
        router.push('/dashboard/student/quizzes');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg={C.bg}
      position="relative"
      overflow="hidden"
      fontFamily="'DM Sans', sans-serif"
    >
      {/* Global styles and font imports */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
          
          /* Noise overlay matching landing page */
          body::after {
            content: '';
            position: fixed;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            opacity: 0.028;
            pointer-events: none;
            z-index: 9998;
          }
        `}
      </style>

      {/* Ambient glows (same as landing page) */}
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

      {/* Main content */}
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
              opacity={0.4}
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
                Welcome Back
              </Heading>

              <Text color={C.textMid} fontSize="15px" textAlign="center">
                Sign in to continue your learning journey
              </Text>

              {/* Live badge - matching landing page */}
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
                  SECURE · AI-POWERED
                </Text>
              </HStack>
            </VStack>

            {/* Form */}
            <chakra.form onSubmit={handleSubmit(onSubmit)} position="relative" zIndex={1}>
              <VStack spacing={5}>
                {/* Email Field */}
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel
                    htmlFor="email"
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
                      id="email"
                      type="email"
                      placeholder="student@example.com"
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
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
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
                      <Icon as={FiMail} color={C.textDim} boxSize="16px" />
                    </InputRightElement>
                  </InputGroup>
                  {errors.email?.message && (
                    <FormErrorMessage fontSize="11px" mt={1} color="#F87171">
                      {errors.email.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                {/* Password Field */}
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel
                    htmlFor="password"
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
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
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
                      <Icon as={FiLock} color={C.textDim} boxSize="16px" />
                    </InputRightElement>
                    <InputRightElement
                      h="full"
                      alignItems="center"
                      justifyContent="center"
                      right="12px"
                      width="auto"
                    >
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        _hover={{ bg: "transparent" }}
                        minW="auto"
                        h="auto"
                        p={0}
                      >
                        <Icon
                          as={showPassword ? FiEyeOff : FiEye}
                          color={C.textDim}
                          boxSize="18px"
                          _hover={{ color: C.textMid }}
                        />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {errors.password?.message && (
                    <FormErrorMessage fontSize="11px" mt={1} color="#F87171">
                      {errors.password.message}
                    </FormErrorMessage>
                  )}
                </FormControl>

                {/* Remember Me & Forgot Password */}
                <Flex justify="space-between" align="center" w="full" mt={2}>
                  <Checkbox
                    colorScheme="orange"
                    {...register('rememberMe')}
                    sx={{
                      "& .chakra-checkbox__control": {
                        borderColor: C.border,
                        bg: C.bg,
                        _checked: {
                          bg: C.amber,
                          borderColor: C.amber,
                          _hover: { bg: C.amber },
                        },
                      },
                    }}
                  >
                    <Text fontSize="13px" color={C.textMid}>
                      Remember me
                    </Text>
                  </Checkbox>

                  <Link
                    href="/auth/forgot-password"
                    fontSize="13px"
                    color={C.amber}
                    _hover={{ color: "#F0B842", textDecoration: "none" }}
                    fontWeight="500"
                  >
                    Forgot Password?
                  </Link>
                </Flex>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={loading}
                  w="full"
                  h="50px"
                  bg={C.amber}
                  color={C.bg}
                  fontSize="14px"
                  fontWeight="700"
                  fontFamily="'DM Sans', sans-serif"
                  borderRadius="10px"
                  rightIcon={<Icon as={FiArrowRight} />}
                  _hover={{
                    bg: "#F0B842",
                    transform: "translateY(-2px)",
                    boxShadow: `0 14px 35px -6px rgba(245,166,35,0.35)`,
                  }}
                  transition="all 0.2s"
                  mt={2}
                >
                  Sign In
                </Button>
              </VStack>
            </chakra.form>

            {/* Sign up link */}
            <Flex justify="center" mt={8} position="relative" zIndex={1}>
              <Text fontSize="13px" color={C.textMid}>
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  color={C.amber}
                  fontWeight="600"
                  _hover={{ color: "#F0B842", textDecoration: "none" }}
                >
                  Sign up
                </Link>
              </Text>
            </Flex>

            {/* Divider */}
            <Box position="relative" mt={8} pt={6}>
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="1px"
                bg={`linear-gradient(to right, transparent, ${C.border}, transparent)`}
              />
              <Text
                fontSize="10px"
                color={C.textDim}
                textAlign="center"
                fontFamily="'DM Mono', monospace"
                letterSpacing="0.08em"
              >
                SECURED BY END-TO-END ENCRYPTION
              </Text>
            </Box>
          </Box>

          {/* Footer note */}
          <Text
            fontSize="10px"
            color={C.textDim}
            textAlign="center"
            mt={6}
            fontFamily="'DM Mono', monospace"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </MotionBox>
      </Container>

      {/* Add pulse animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.45; transform: scale(1.7); }
          }
        `}
      </style>
    </Box>
  );
}