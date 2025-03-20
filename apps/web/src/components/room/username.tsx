'use client';

import { getColorForUsername } from '@/utils/color-utils';

interface UsernameProps {
  username: string;
}

export function Username({ username }: UsernameProps) {
  const color = getColorForUsername(username);

  return (
    <span className="font-medium text-sm" style={{ color }}>
      {username}
    </span>
  );
}
