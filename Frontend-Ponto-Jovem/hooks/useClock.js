import { useEffect, useState } from 'react';
import { formatTime } from '../utils/date';
export const useClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return { time, formattedTime: formatTime(time) };
};
