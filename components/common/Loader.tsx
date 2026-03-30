import {
    Center,
    Spinner,
    VStack,
    Text,
    Box,
    keyframes,
  } from '@chakra-ui/react';
  
  const pulse = keyframes`
    0% { opacity: 0.6; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  `;
  
  interface LoaderProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
  }
  
  export function Loader({ size = 'lg', text = 'Loading...', fullScreen = false }: LoaderProps) {
    const content = (
      <Center flexDirection="column" gap={4}>
        <Spinner
          size={size}
          color="primary.500"
          thickness="3px"
          speed="0.65s"
          animation={`${pulse} 1s ease-in-out infinite alternate`}
        />
        {text && (
          <Text color="neutral.500" fontSize="sm" fontWeight="medium">
            {text}
          </Text>
        )}
      </Center>
    );
  
    if (fullScreen) {
      return (
        <Center
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="white"
          zIndex={9999}
        >
          {content}
        </Center>
      );
    }
  
    return <Box py={12}>{content}</Box>;
  }