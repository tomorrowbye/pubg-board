'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClanBadgeProps {
  accountId: string;
  shard: string;
  className?: string;
}

export default function ClanBadge({ accountId, shard, className = '' }: ClanBadgeProps) {
  const [clan, setClan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClanInfo() {
      if (!accountId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/pubg/players/${accountId}/clan?shard=${shard}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Not found is not an error for display purposes
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch clan data');
        }
        
        const data = await response.json();
        
        if (data.clan && data.clan.found) {
          setClan(data.clan);
        }
      } catch (err: any) {
        console.error('Error fetching clan info:', err);
        setError(err.message || 'Failed to load clan information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClanInfo();
  }, [accountId, shard]);

  if (loading) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error || !clan) {
    return null; // Don't show anything if there's an error or no clan
  }

  return (
    <Link 
      href={`/clan/${clan.id}?shard=${shard}`}
      className={`inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors ${className}`}
    >
      <span className="mr-1">[{clan.tag}]</span>
      {clan.name}
    </Link>
  );
}