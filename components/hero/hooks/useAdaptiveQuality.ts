import { useState, useEffect } from 'react';
import { getGPUTier } from 'detect-gpu';

type QualityTier = 'high' | 'medium' | 'low';

interface AdaptiveQuality {
  tier: QualityTier;
  isMobile: boolean;
}

export function useAdaptiveQuality(): AdaptiveQuality {
  const [quality, setQuality] = useState<AdaptiveQuality>({
    tier: 'medium',
    isMobile: false,
  });

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      const isMobile =
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || ('ontouchstart' in window && window.innerWidth < 768);

      try {
        const gpuTier = await getGPUTier();

        if (cancelled) return;

        let tier: QualityTier;
        if (gpuTier.tier >= 3) {
          tier = 'high';
        } else if (gpuTier.tier >= 2) {
          tier = 'medium';
        } else {
          tier = 'low';
        }

        if (isMobile && tier === 'high') {
          tier = 'medium';
        }

        setQuality({ tier, isMobile });
      } catch {
        if (!cancelled) {
          setQuality({ tier: isMobile ? 'low' : 'medium', isMobile });
        }
      }
    };

    detect();

    return () => {
      cancelled = true;
    };
  }, []);

  return quality;
}
