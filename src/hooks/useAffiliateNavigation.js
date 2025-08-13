import { useNavigate } from 'react-router-dom';
import { getCurrentAffiliateCode, createAffiliateLink } from '../App';

export const useAffiliateNavigation = () => {
  const navigate = useNavigate();

  const navigateWithAffiliate = (path, options = {}) => {
    // Get current affiliate code from URL
    const currentAffiliateCode = getCurrentAffiliateCode();
    
    // Create path with affiliate code if present
    const affiliatePath = createAffiliateLink(path, currentAffiliateCode);
    
    console.log('Affiliate Navigation:', {
      originalPath: path,
      affiliateCode: currentAffiliateCode,
      affiliatePath: affiliatePath,
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
