import {
    Button as ChakraButton,
    ButtonProps as ChakraButtonProps,
    forwardRef,
  } from '@chakra-ui/react';
  
  interface ButtonProps extends ChakraButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }
  
  export const Button = forwardRef<ButtonProps, 'button'>((props, ref) => {
    const { variant = 'primary', size = 'md', children, ...rest } = props;
  
    const variants = {
      primary: {
        bg: 'primary.500',
        color: 'white',
        _hover: { bg: 'primary.600', transform: 'translateY(-2px)' },
        _active: { transform: 'translateY(0)' },
      },
      secondary: {
        bg: 'accent.500',
        color: 'white',
        _hover: { bg: 'accent.600', transform: 'translateY(-2px)' },
        _active: { transform: 'translateY(0)' },
      },
      outline: {
        bg: 'transparent',
        color: 'primary.500',
        border: '2px solid',
        borderColor: 'primary.500',
        _hover: { bg: 'primary.50', transform: 'translateY(-2px)' },
        _active: { transform: 'translateY(0)' },
      },
      ghost: {
        bg: 'transparent',
        color: 'neutral.600',
        _hover: { bg: 'neutral.100' },
      },
      danger: {
        bg: 'error.500',
        color: 'white',
        _hover: { bg: 'error.600', transform: 'translateY(-2px)' },
        _active: { transform: 'translateY(0)' },
      },
    };
  
    const sizes = {
      sm: { px: 3, py: 2, fontSize: 'sm', borderRadius: 'lg' },
      md: { px: 6, py: 3, fontSize: 'md', borderRadius: 'xl' },
      lg: { px: 8, py: 4, fontSize: 'lg', borderRadius: 'xl' },
    };
  
    return (
      <ChakraButton
        ref={ref}
        {...variants[variant]}
        {...sizes[size]}
        transition="all 0.2s"
        fontWeight="semibold"
        {...rest}
      >
        {children}
      </ChakraButton>
    );
  });
  
  Button.displayName = 'Button';