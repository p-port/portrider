
import { useNavigate } from 'react-router-dom';

export const useBackNavigation = () => {
  const navigate = useNavigate();

  const goBack = () => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    
    // If we're at root or only one level deep, go to root
    if (pathSegments.length <= 1) {
      navigate('/');
      return;
    }
    
    // Remove the last segment to go up one directory
    pathSegments.pop();
    const parentPath = '/' + pathSegments.join('/');
    navigate(parentPath);
  };

  return { goBack };
};
