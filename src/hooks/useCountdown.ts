import { useState, useEffect } from "react";

export function useCountdown(initialSeconds: number = 30) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isCounting && seconds > 0) {
      timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    } else if (seconds === 0) {
      setIsCounting(false);
      setSeconds(initialSeconds);
    }
    return () => clearTimeout(timer);
  }, [isCounting, seconds, initialSeconds]);

  const startCountdown = () => {
    setIsCounting(true);
    setSeconds(initialSeconds);
  };

  return { seconds, isCounting, startCountdown };
}
