"use client";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // ✅ Fixed import
import { motion, isValidMotionProp } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiShield,
  FiTrendingUp,
  FiZap,
  FiPlay,
} from "react-icons/fi";

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (p) => isValidMotionProp(p) || p === "children" || p === "style",
});

// ── Colour palette ──────────────────────────────────────────────────────────
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

// ✅ These now work correctly with @emotion/react keyframes
const pulseDot = keyframes`
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.45; transform:scale(1.7); }
`;

const tickerScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const STATS = [
  { val: "12,400+", label: "Active Students" },
  { val: "3.2M",    label: "Questions Answered" },
  { val: "94%",     label: "Pass Rate Improvement" },
  { val: "500+",    label: "Expert Teachers" },
];

const FEATURES = [
  { icon: FiZap,       accent: C.amber,    title: "AI Question Engine",   desc: "GPT-4o generates MCQ, NAT and True/False questions per topic — with teacher sign-off before going live." },
  { icon: FiTrendingUp,accent: C.electric, title: "Adaptive Difficulty",  desc: "Server-side engine tracks streaks and auto-scales difficulty. No client-side spoofing, ever." },
  { icon: FiAward,     accent: "#A78BFA",  title: "Gamification Stack",   desc: "18 badges, XP levels, daily streaks and per-channel leaderboards — all tamper-proof." },
  { icon: FiBarChart2, accent: "#34D399",  title: "Live Analytics",       desc: "Real-time attempt data flows to teacher dashboards. Spot weak topics per student instantly." },
  { icon: FiShield,    accent: "#F87171",  title: "Anti-Cheat Layer",     desc: "Randomised order, per-IP throttling, tab-switch detection, time-limit enforcement — server-side." },
  { icon: FiBarChart2, accent: "#60A5FA",  title: "Stripe Payments",      desc: "Teachers set per-channel pricing. Stripe webhooks handle activation, renewal, and expiry automatically." },
];

const QUIZ_OPTIONS = [
  "A)  Particles share quantum state regardless of distance",
  "B)  Particles exchange photons faster than light",
  "C)  Energy is quantised into discrete packets",
  "D)  Electrons orbit in fixed shells around nucleus",
];

const GRADES = [
  { label: "Class 5–6",  accent: "#60A5FA", sub: "Foundations"   },
  { label: "Class 7–8",  accent: "#34D399", sub: "Intermediate"  },
  { label: "Class 9–10", accent: C.amber,   sub: "Board Prep"    },
  { label: "Class 11",   accent: "#A78BFA", sub: "JEE/NEET Base" },
  { label: "Class 12",   accent: "#F87171", sub: "Advanced Prep" },
  { label: "JEE Mains",  accent: C.electric,sub: "Entrance Exam" },
  { label: "JEE Adv.",   accent: C.amber,   sub: "IIT Level"     },
  { label: "NEET",       accent: "#34D399", sub: "Medical Prep"  },
];

export default function LandingPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePick = (i: number) => {
    setSelected(i);
    setTimeout(() => setRevealed(true), 350);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x:  ((e.clientX - r.left)  / r.width  - 0.5) * 12,
      y: -((e.clientY - r.top)   / r.height - 0.5) * 12,
    });
  };

  return (
    <Box
      bg={C.bg}
      color={C.text}
      fontFamily="'DM Sans', sans-serif"
      minH="100vh"
      position="relative"
      overflowX="hidden"
    >
      {/* ── Fonts + global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: ${C.bg}; overflow-x: hidden; }

        /* Noise overlay */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.028;
          pointer-events: none;
          z-index: 9998;
        }

        .feat-card {
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 16px;
          padding: 28px;
          transition: border-color .22s, transform .22s, background .22s;
          position: relative;
          overflow: hidden;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
        }
        .feat-card:hover {
          border-color: ${C.borderHi};
          background: ${C.surfaceHi};
          transform: translateY(-5px);
        }

        .quiz-opt {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          background: ${C.bg};
          border: 1px solid ${C.border};
          cursor: pointer;
          transition: border-color .15s, background .15s;
        }
        .quiz-opt:hover       { border-color: ${C.amber}; background: ${C.amberGlow}; }
        .quiz-opt.sel         { border-color: ${C.amber}; background: ${C.amberGlow}; }
        .quiz-opt.correct     { border-color: #34D399;    background: rgba(52,211,153,.12); }

        .grade-pill {
          padding: 10px 14px;
          background: ${C.bg};
          border: 1px solid ${C.border};
          border-radius: 10px;
          cursor: pointer;
          transition: border-color .18s, background .18s;
        }

        .role-card {
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 16px;
          padding: 28px;
          transition: border-color .22s, transform .22s;
          position: relative;
          overflow: hidden;
        }
        .role-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
        }
        .role-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* ── Ambient glows ── */}
      <Box position="absolute" top="-180px" right="-80px" w="600px" h="600px"
        borderRadius="full" bg="radial-gradient(circle, rgba(245,166,35,0.11) 0%, transparent 70%)"
        filter="blur(2px)" pointerEvents="none" zIndex={0} />
      <Box position="absolute" bottom="30%" left="-120px" w="480px" h="480px"
        borderRadius="full" bg="radial-gradient(circle, rgba(60,239,255,0.07) 0%, transparent 70%)"
        pointerEvents="none" zIndex={0} />

      {/* ══════════ NAVBAR ══════════ */}
      <Box
        as="nav" position="sticky" top={0} zIndex={100}
        borderBottom={`1px solid ${C.border}`}
        sx={{ backdropFilter: "blur(20px)", background: "rgba(8,11,16,0.88)" }}
      >
        <Container maxW="7xl">
          <Flex h="62px" align="center" justify="space-between">
            <HStack spacing={2}>
              <Flex w="26px" h="26px" bg={C.amber} borderRadius="6px" align="center" justify="center">
                <Text fontSize="13px" fontWeight="800" color={C.bg} lineHeight={1}>Q</Text>
              </Flex>
              <Text fontFamily="'Playfair Display', serif" fontWeight="700" fontSize="17px"
                letterSpacing="-0.3px" color={C.text}>
                QuizAI
              </Text>
            </HStack>

            <HStack spacing={7} display={{ base: "none", md: "flex" }}>
              {["Features", "Pricing", "For Teachers", "Docs"].map((l) => (
                <Text key={l} fontSize="13.5px" color={C.textMid} fontWeight="500"
                  cursor="pointer" _hover={{ color: C.text }} transition="color .15s">
                  {l}
                </Text>
              ))}
            </HStack>

            <HStack spacing={2}>
            <Link href={"/auth/login"}>  <Button size="sm" variant="ghost" color={C.textMid}
                _hover={{ color: C.text, bg: C.surfaceHi }}
                fontFamily="'DM Sans', sans-serif" fontWeight="500" h="36px">
                Log in
              </Button></Link>
              <Button size="sm" bg={C.amber} color={C.bg} fontWeight="700"
                _hover={{ bg: "#F0B842", transform: "translateY(-1px)" }}
                borderRadius="8px" px={5} h="36px"
                fontFamily="'DM Sans', sans-serif" transition="all .15s">
                Get started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* ══════════ HERO ══════════ */}
      <Container maxW="7xl" pt={{ base: 16, md: 24 }} pb={20} position="relative" zIndex={1}>
        {/* Live badge */}
        <MotionBox
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          display="inline-flex"
          alignItems="center"
          gap="8px"
          px="12px" py="6px"
          border={`1px solid ${C.border}`}
          borderRadius="full"
          bg={C.surface}
          mb={7}
        >
          <Box w="7px" h="7px" borderRadius="full" bg="#34D399"
            sx={{ animation: `${pulseDot} 2s ease-in-out infinite` }} />
          <Text fontSize="11px" color={C.textMid} fontFamily="'DM Mono', monospace" fontWeight="500">
            Class 5 → JEE · Adaptive AI · Live Quizzes
          </Text>
        </MotionBox>

        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 14, lg: 18 }} align="center">

          {/* Left — headline */}
          <VStack align="flex-start" spacing={0} flex="1.2">
            <MotionBox
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              mb={6}
            >
              <Heading
                as="h1"
                fontFamily="'Playfair Display', serif"
                fontWeight="900"
                fontSize={{ base: "50px", md: "68px", lg: "78px" }}
                lineHeight="1.01"
                letterSpacing="-2.5px"
                color={C.text}
              >
                Learn faster.
                <br />
                Score{" "}
                <chakra.span
                  color={C.amber}
                  fontStyle="italic"
                  position="relative"
                  _after={{
                    content: '""', position: "absolute",
                    bottom: "-2px", left: 0, width: "100%", height: "3px",
                    background: `linear-gradient(to right, ${C.amber}, transparent)`,
                    borderRadius: "2px",
                  }}
                >
                  higher.
                </chakra.span>
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              mb={9}
            >
              <Text fontSize={{ base: "15px", md: "17px" }} color={C.textMid}
                lineHeight="1.8" maxW="460px" fontWeight="400">
                AI-generated quizzes tailored to grade and subject.
                Real-time competitions, adaptive difficulty, and leaderboards
                that reward consistent effort — not just exam-day luck.
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.36 }}
            >
              <HStack spacing={3} flexWrap="wrap">
                <Button
                  h="50px" px={8} bg={C.amber} color={C.bg}
                  fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="14.5px"
                  borderRadius="10px" rightIcon={<Icon as={FiArrowRight} />}
                  _hover={{ bg: "#F0B842", transform: "translateY(-2px)",
                    boxShadow: `0 14px 35px -6px rgba(245,166,35,0.35)` }}
                  transition="all .2s">
                  Start for free
                </Button>
                <Button
                  h="50px" px={7} bg="transparent" color={C.textMid}
                  border={`1px solid ${C.border}`}
                  fontFamily="'DM Sans', sans-serif" fontWeight="500" fontSize="14.5px"
                  borderRadius="10px" leftIcon={<Icon as={FiPlay} boxSize="12px" />}
                  _hover={{ bg: C.surfaceHi, color: C.text, borderColor: C.borderHi }}
                  transition="all .2s">
                  90s demo
                </Button>
              </HStack>

              {/* Social proof */}
              <HStack mt={7} spacing={3}>
                <HStack spacing="-9px">
                  {[C.amber, C.electric, "#A78BFA", "#34D399"].map((c, i) => (
                    <Flex key={i} w="26px" h="26px" borderRadius="full" bg={c}
                      border={`2px solid ${C.bg}`} align="center" justify="center">
                      <Text fontSize="9px" fontWeight="800" color={C.bg}>
                        {["A","B","C","D"][i]}
                      </Text>
                    </Flex>
                  ))}
                </HStack>
                <Text fontSize="12.5px" color={C.textDim} fontWeight="500">
                  Joined by{" "}
                  <chakra.span color={C.amber} fontWeight="700">12,400+</chakra.span>
                  {" "}students this month
                </Text>
              </HStack>
            </MotionBox>
          </VStack>

          {/* Right — 3D tilt quiz card */}
          <MotionBox
            flex="1"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ perspective: "1200px" }}
          >
            <Box
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transition: "transform 0.12s ease",
                transformStyle: "preserve-3d",
              }}
            >
              <Box
                bg={C.surface} border={`1px solid ${C.border}`}
                borderRadius="20px" p={7} maxW="470px" w="full"
                position="relative" overflow="hidden"
                boxShadow={`0 50px 100px -30px rgba(0,0,0,0.7), 0 0 0 1px ${C.border}`}
              >
                {/* Glow corner */}
                <Box position="absolute" top="-60px" right="-60px" w="200px" h="200px"
                  borderRadius="full" bg={C.amberGlow} filter="blur(40px)" pointerEvents="none" />

                {/* Header */}
                <Flex justify="space-between" align="center" mb={5}>
                  <HStack spacing={2}>
                    <Box w="7px" h="7px" borderRadius="full" bg="#34D399"
                      sx={{ animation: `${pulseDot} 2s ease-in-out infinite` }} />
                    <Text fontSize="10.5px" color="#34D399"
                      fontFamily="'DM Mono', monospace" fontWeight="500">
                      LIVE · Q 08 / 15
                    </Text>
                  </HStack>
                  <Flex px={2} py={1} bg={C.bg} borderRadius="6px"
                    border={`1px solid ${C.border}`} align="center">
                    <Text fontSize="11px" color={C.amber}
                      fontFamily="'DM Mono', monospace">02:34</Text>
                  </Flex>
                </Flex>

                {/* Progress bar */}
                <Box h="3px" bg={C.border} borderRadius="full" mb={5} overflow="hidden">
                  <Box h="full" w="53%"
                    bg={`linear-gradient(to right, ${C.amber}, #F0B842)`}
                    borderRadius="full" />
                </Box>

                {/* Question */}
                <Box bg={C.bg} border={`1px solid ${C.border}`} borderRadius="12px" p={5} mb={4}>
                  <Text fontSize="10px" color={C.textDim}
                    fontFamily="'DM Mono', monospace" mb={2} letterSpacing="0.08em">
                    PHYSICS · CLASS 12 · HARD
                  </Text>
                  <Text fontSize="13.5px" color={C.text} fontWeight="500" lineHeight="1.65">
                    What best describes the principle of quantum entanglement between two particles?
                  </Text>
                </Box>

                {/* Options */}
                <VStack spacing={2} mb={4}>
                  {QUIZ_OPTIONS.map((opt, i) => (
                    <Box
                      key={i}
                      as="div"
                      className={`quiz-opt${selected === i ? " sel" : ""}${revealed && i === 0 ? " correct" : ""}`}
                      onClick={() => handlePick(i)}
                    >
                      <Text
                        fontSize="12.5px"
                        color={revealed && i === 0 ? "#34D399" : selected === i ? C.amber : C.textMid}
                        fontWeight="500"
                      >
                        {opt}
                      </Text>
                    </Box>
                  ))}
                </VStack>

                {/* Bottom bar */}
                <Flex align="center" justify="space-between"
                  pt={3} borderTop={`1px solid ${C.border}`}>
                  <HStack spacing={2}>
                    {[C.amber, C.electric, "#A78BFA"].map((c, i) => (
                      <Box key={i} w="5px" h="5px" borderRadius="full" bg={c} />
                    ))}
                  </HStack>
                  <Text fontSize="10.5px" color={C.textDim}
                    fontFamily="'DM Mono', monospace">
                    🔥 7-day streak · ⭐ 1,240 pts
                  </Text>
                </Flex>
              </Box>
            </Box>
          </MotionBox>
        </Flex>
      </Container>

      {/* ══════════ STATS TICKER ══════════ */}
      <Box borderTop={`1px solid ${C.border}`} borderBottom={`1px solid ${C.border}`}
        py="17px" overflow="hidden" position="relative" zIndex={1} bg={C.surface}>
        <Box sx={{ animation: `${tickerScroll} 28s linear infinite` }}
          display="flex" width="max-content"
          _hover={{ animationPlayState: "paused" }}>
          {[...STATS, ...STATS, ...STATS, ...STATS].map((s, i) => (
            <HStack key={i} spacing={3} mr={14} flexShrink={0}>
              <Text fontSize="20px" fontFamily="'Playfair Display', serif"
                fontWeight="700" color={C.amber}>{s.val}</Text>
              <Text fontSize="12.5px" color={C.textMid} fontWeight="500">{s.label}</Text>
              <Box w="3px" h="3px" borderRadius="full" bg={C.textDim} />
            </HStack>
          ))}
        </Box>
      </Box>

      {/* ══════════ FEATURES ══════════ */}
      <Box py={{ base: 20, md: 28 }} position="relative" zIndex={1}>
        <Box position="absolute" top="5%" left="50%" transform="translateX(-50%)"
          w="700px" h="400px" borderRadius="full"
          bg="radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)"
          pointerEvents="none" />

        <Container maxW="7xl" position="relative" zIndex={1}>
          {/* Section header — asymmetric editorial */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "flex-end" }}
            mb={13} gap={6}
          >
            <Box>
              <Text fontSize="11px" color={C.amber} fontFamily="'DM Mono', monospace"
                letterSpacing="0.15em" mb={3} fontWeight="500">── CAPABILITIES</Text>
              <Heading
                fontFamily="'Playfair Display', serif" fontWeight="900"
                fontSize={{ base: "36px", md: "52px" }}
                letterSpacing="-1.5px" lineHeight="1.05" color={C.text}
              >
                Built to be
                <br />
                <chakra.span color={C.amber} fontStyle="italic">bulletproof.</chakra.span>
              </Heading>
            </Box>
            <Text fontSize="14px" color={C.textMid} maxW="330px" lineHeight="1.8"
              fontWeight="400" flexShrink={0}>
              Every feature designed around two non-negotiables:
              learning outcomes and academic integrity.
            </Text>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {FEATURES.map((f, i) => (
              <MotionBox
                key={i}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <Box
                  className="feat-card"
                  h="full"
                  sx={{
                    "&::before": {
                      background: `linear-gradient(to right, ${f.accent}, transparent)`,
                    },
                  }}
                >
                  <Flex
                    w="42px" h="42px" borderRadius="10px"
                    bg={`${f.accent}18`} border={`1px solid ${f.accent}28`}
                    align="center" justify="center" mb={5}
                  >
                    <Icon as={f.icon} boxSize={5} color={f.accent} />
                  </Flex>
                  <Text fontFamily="'DM Sans', sans-serif" fontWeight="600"
                    fontSize="14.5px" color={C.text} mb={2} letterSpacing="-0.2px">
                    {f.title}
                  </Text>
                  <Text fontSize="13px" color={C.textMid} lineHeight="1.72" fontWeight="400">
                    {f.desc}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════ GRADE TRACK ══════════ */}
      <Box py={{ base: 14, md: 20 }} position="relative" zIndex={1}>
        <Container maxW="7xl">
          <Box bg={C.surface} border={`1px solid ${C.border}`}
            borderRadius="20px" p={{ base: 8, md: 12 }}
            position="relative" overflow="hidden">
            {/* Decorative accent lines */}
            {[0, 1].map((i) => (
              <Box key={i} position="absolute"
                right={`${120 + i * 40}px`} top="-20px"
                w="1px" h="180px"
                bg={`linear-gradient(to bottom, transparent, ${C.amber}50, transparent)`} />
            ))}

            <Flex direction={{ base: "column", md: "row" }} gap={10} align="center">
              <VStack align="flex-start" spacing={4} flex="1">
                <Text fontSize="11px" color={C.amber} fontFamily="'DM Mono', monospace"
                  letterSpacing="0.15em" fontWeight="500">── LEARNING PATH</Text>
                <Heading fontFamily="'Playfair Display', serif" fontWeight="900"
                  fontSize={{ base: "30px", md: "42px" }}
                  letterSpacing="-1px" lineHeight="1.1" color={C.text}>
                  From Class 5<br />
                  all the way to{" "}
                  <chakra.span color={C.amber} fontStyle="italic">JEE.</chakra.span>
                </Heading>
                <Text fontSize="13.5px" color={C.textMid} lineHeight="1.8" maxW="340px">
                  Adaptive paths that follow the Indian curriculum from elementary
                  foundations through to competitive entrance exam preparation.
                </Text>
                <Button
                  mt={2} h="42px" px={6} bg="transparent" color={C.amber}
                  border={`1px solid ${C.amber}45`} borderRadius="9px"
                  fontFamily="'DM Sans', sans-serif" fontWeight="600" fontSize="13px"
                  rightIcon={<Icon as={FiArrowRight} boxSize="12px" />}
                  _hover={{ bg: C.amberGlow, borderColor: C.amber }}
                  transition="all .18s">
                  See full curriculum
                </Button>
              </VStack>

              <Box flex="1.2">
                <Flex flexWrap="wrap" gap={3}>
                  {GRADES.map((g) => (
                    <Box
                      key={g.label}
                      className="grade-pill"
                      sx={{
                        "&:hover": {
                          borderColor: g.accent,
                          background: `${g.accent}10`,
                        },
                      }}
                    >
                      <Text fontSize="12.5px" fontWeight="600" color={g.accent}>{g.label}</Text>
                      <Text fontSize="10.5px" color={C.textDim}
                        fontFamily="'DM Mono', monospace">{g.sub}</Text>
                    </Box>
                  ))}
                </Flex>
              </Box>
            </Flex>
          </Box>
        </Container>
      </Box>

      {/* ══════════ ROLES ══════════ */}
      <Box py={{ base: 14, md: 22 }} position="relative" zIndex={1}>
        <Container maxW="7xl">
          <Text fontSize="11px" color={C.electric} fontFamily="'DM Mono', monospace"
            letterSpacing="0.15em" mb={5} fontWeight="500">── WHO IT'S FOR</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            {[
              {
                role: "Students", accent: C.amber, icon: "📚",
                desc: "Subscribe to expert channels. Take adaptive quizzes. Climb leaderboards.",
                items: ["Free & paid channel subscriptions","Adaptive MCQ, NAT, True/False","Progress tracker per channel","Badges, streaks, XP levels","AI hints when you're stuck"],
              },
              {
                role: "Teachers", accent: C.electric, icon: "🎓",
                desc: "Create channels. Generate AI questions. Track every student.",
                items: ["Channel creation (free or paid)","GPT-4o question generation","Approve questions before publishing","Bulk push notifications","Real-time attempt analytics"],
              },
              {
                role: "Admins", accent: "#A78BFA", icon: "🔧",
                desc: "Full platform control with audit logs and revenue reporting.",
                items: ["User & channel management","Stripe revenue dashboard","Suspicious activity flags","Platform-wide analytics","Notification rate controls"],
              },
            ].map((r) => (
              <Box
                key={r.role}
                className="role-card"
                sx={{
                  "&:hover": { borderColor: `${r.accent}55` },
                  "&::before": {
                    background: `linear-gradient(to right, ${r.accent}, transparent)`,
                  },
                }}
              >
                <Text fontSize="26px" mb={3}>{r.icon}</Text>
                <Text fontFamily="'Playfair Display', serif" fontWeight="700"
                  fontSize="22px" color={r.accent} mb={2}>{r.role}</Text>
                <Text fontSize="13px" color={C.textMid} mb={5} lineHeight="1.65">{r.desc}</Text>
                <VStack align="flex-start" spacing={2}>
                  {r.items.map((item) => (
                    <HStack key={item} spacing={2} align="flex-start">
                      <Text color={r.accent} fontSize="12px" mt="2px" flexShrink={0}>▸</Text>
                      <Text fontSize="13px" color={C.textMid} lineHeight="1.55">{item}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════ CTA ══════════ */}
      <Box py={{ base: 20, md: 28 }} position="relative" zIndex={1}>
        <Container maxW="5xl">
          <Box
            position="relative" overflow="hidden"
            borderRadius="22px" border={`1px solid ${C.border}`}
            bg={C.surface} p={{ base: 10, md: 16 }} textAlign="center"
          >
            {/* Background glow */}
            <Box
              position="absolute" top="50%" left="50%"
              transform="translate(-50%, -50%)"
              w="560px" h="280px" bg={C.amberGlow}
              filter="blur(60px)" borderRadius="full"
              pointerEvents="none" zIndex={0}
            />

            <VStack spacing={6} position="relative" zIndex={1}>
              <Text fontSize="11px" color={C.amber} fontFamily="'DM Mono', monospace"
                letterSpacing="0.15em" fontWeight="500">── GET STARTED</Text>
              <Heading
                fontFamily="'Playfair Display', serif" fontWeight="900"
                fontSize={{ base: "36px", md: "56px" }}
                letterSpacing="-1.5px" lineHeight="1.05" color={C.text}
              >
                Ready to make every
                <br />exam{" "}
                <chakra.span color={C.amber} fontStyle="italic">yours?</chakra.span>
              </Heading>
              <Text fontSize="15px" color={C.textMid} maxW="440px" lineHeight="1.8">
                Join over 12,000 students who improved their scores by an average
                of 23% within the first month.
              </Text>
              <HStack spacing={3} pt={2} flexWrap="wrap" justify="center">
                <Button
                  h="52px" px={9} bg={C.amber} color={C.bg}
                  fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="14.5px"
                  borderRadius="10px" rightIcon={<Icon as={FiArrowRight} />}
                  _hover={{ bg: "#F0B842", transform: "translateY(-2px)",
                    boxShadow: `0 20px 50px -10px rgba(245,166,35,0.35)` }}
                  transition="all .2s">
                  Create free account
                </Button>
                <Button
                  h="52px" px={7} bg="transparent" color={C.textMid}
                  border={`1px solid ${C.border}`}
                  fontFamily="'DM Sans', sans-serif" fontWeight="500" fontSize="14.5px"
                  borderRadius="10px"
                  _hover={{ bg: C.surfaceHi, color: C.text, borderColor: C.borderHi }}
                  transition="all .2s">
                  Create a channel →
                </Button>
              </HStack>
              <Text fontSize="11.5px" color={C.textDim} fontFamily="'DM Mono', monospace">
                No credit card required · Free tier forever
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* ══════════ FOOTER ══════════ */}
      <Box borderTop={`1px solid ${C.border}`} py={9} position="relative" zIndex={1} bg={C.bg}>
        <Container maxW="7xl">
          <Flex direction={{ base: "column", md: "row" }}
            justify="space-between" align="center" gap={4}>
            <HStack spacing={2}>
              <Flex w="22px" h="22px" bg={C.amber} borderRadius="5px"
                align="center" justify="center">
                <Text fontSize="11px" fontWeight="800" color={C.bg}>Q</Text>
              </Flex>
              <Text fontFamily="'Playfair Display', serif" fontWeight="700"
                fontSize="15px" color={C.text}>QuizAI</Text>
            </HStack>
            <Text fontSize="11.5px" color={C.textDim} fontFamily="'DM Mono', monospace">
              © 2026 QuizAI · Next.js + MongoDB + OpenAI + Stripe
            </Text>
            <HStack spacing={5}>
              {["Privacy", "Terms", "Contact", "Docs"].map((l) => (
                <Text key={l} fontSize="12px" color={C.textDim} cursor="pointer"
                  _hover={{ color: C.textMid }} transition="color .15s"
                  fontFamily="'DM Sans', sans-serif">{l}</Text>
              ))}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}