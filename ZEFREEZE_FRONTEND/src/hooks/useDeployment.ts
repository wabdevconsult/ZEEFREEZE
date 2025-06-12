import { useState, useEffect } from 'react';
import { getDeploymentStatus } from '../services/deploymentService';
import { useAuth } from '../contexts/AuthContext'; // adapte selon le chemin exact


export const useDeployment = (deployId?: string) => {
  const { user } = useAuth();
if (!user || !user._id) return { data: [], isLoading: false };
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const { user } = useAuth();
  if (!user || !user._id) return;
  useEffect(() => {
    if (!deployId) return;

    const checkStatus = async () => {
      setIsLoading(true);
      try {
        const deploymentStatus = await getDeploymentStatus({ id: deployId });
        setStatus(deploymentStatus.status);
        setDeployUrl(deploymentStatus.deploy_url || null);
        setClaimUrl(deploymentStatus.claim_url || null);
        setIsClaimed(deploymentStatus.claimed || false);
      } catch (err) {
        console.error('Error checking deployment status:', err);
        setError('Failed to check deployment status');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    
    // Poll for status updates every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, [deployId]);

  return { status, isLoading, error, deployUrl, claimUrl, isClaimed };
};