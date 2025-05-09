import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ClanBadgeProps {
  clanId?: string;
  clanName?: string;
  clanTag?: string;
  className?: string;
  showLink?: boolean;
}

const ClanBadge: React.FC<ClanBadgeProps> = ({
  clanId = '',
  clanName = '',
  clanTag,
  className,
  showLink = true,
}) => {
  // 确保必要数据存在
  if (!clanName) {
    return null;
  }
  
  const content = (
    <div className={cn(
      "inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
      className
    )}>
      {clanTag && <span className="mr-1 font-mono">[{clanTag}]</span>}
      <span>{clanName}</span>
    </div>
  );

  if (showLink && clanId) {
    return (
      <Link href={`/clan/${clanId}`} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default ClanBadge;