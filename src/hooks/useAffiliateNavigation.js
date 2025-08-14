import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentAffiliateCode, createAffiliateLink } from '../App';

export const useAffiliateNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithAffiliate = (path, options = {}) => {
    // Get current affiliate code from URL or localStorage
    let currentAffiliateCode = getCurrentAffiliateCode();
    
    // If no affiliate code in URL, check localStorage
    if (!currentAffiliateCode) {
      try {
        currentAffiliateCode = localStorage.getItem('affiliateCode');
      } catch (err) {
        console.warn('Could not read affiliate code from localStorage:', err);
      }
    }
    
    // Create path with affiliate code if present
    const affiliatePath = createAffiliateLink(path, currentAffiliateCode);
    
    console.log('Affiliate Navigation:', {
      originalPath: path,
      affiliateCode: currentAffiliateCode,
      affiliatePath: affiliatePath,
      currentLocation: location.pathname,
      options
    });
    
    // Navigate with affiliate path
    navigate(affiliatePath, options);
  };

  return {
    navigate: navigateWithAffiliate,
    navigateWithAffiliate
  };
};
