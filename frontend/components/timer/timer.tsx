import React, {useState, useEffect} from 'react';

const Timer: React.FC = () => {
    const [initialTime, setInitialTimer] = useState<number>(0);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isTimerRunning && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime(prevSeconds => prevSeconds - 1);
            }, 1000);
        } else if (remainingTime < 0) {
            setIsTimerRunning(false);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isTimerRunning]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInitialTimer(Number(e.target.value));
    }

    const startTimer = () => {
        if (!isTimerRunning && initialTime > 0) {
            setRemainingTime(initialTime);
            setIsTimerRunning(true);
        }
    };

    return (
        <div>
            <input
                type="number"
                value={initialTime}
                onChange={handleInputChange}
                placeholder="Set time in seconds"
            />
            <button onClick={startTimer}>
                Start Timer
            </button>
            <h2>Time Remaining: {remainingTime}s</h2>
        </div>
    )
}

export default Timer;