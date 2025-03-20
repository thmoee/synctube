'use client';

import { format, parseISO } from 'date-fns';

interface TimestampProps {
  timestamp: string;
}

export function Timestamp({ timestamp }: TimestampProps) {
  const time = format(parseISO(timestamp), 'HH:mm');

  return <span className="text-xs text-gray-500">{time}</span>;
}
