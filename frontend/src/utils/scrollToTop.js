// utils/scrollToTop.js

/**
 * Utility function to scroll to top of page smoothly
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Hook to scroll to top when component mounts
 */
export const useScrollToTop = () => {
  React.useEffect(() => {
    scrollToTop();
  }, []);
};

/**
 * Component that automatically scrolls to top when route changes
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return null;
};

export default scrollToTop;