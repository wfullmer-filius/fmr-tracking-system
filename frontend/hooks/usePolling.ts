import { useEffect, useRef } from "react";

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number;
  onPoll: () => void;
}

export function usePolling({ enabled = true, interval = 30000, onPoll }: UsePollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onPollRef = useRef(onPoll);

  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      onPollRef.current();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);
}