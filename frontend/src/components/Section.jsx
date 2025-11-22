// components/Section.jsx
import React from 'react';
import Container from './Container';

const Section = ({ 
  children, 
  className = "",
  containerSize = 'default',
  padding = 'default',
  background = '',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'py-8 md:py-12',
    default: 'py-12 md:py-16 lg:py-20',
    lg: 'py-16 md:py-20 lg:py-24',
    xl: 'py-20 md:py-24 lg:py-28'
  };

  return (
    <section 
      className={`${paddingClasses[padding]} ${background} ${className}`}
      {...props}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
};

export default Section;