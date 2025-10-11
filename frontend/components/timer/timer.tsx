// components/timer/timer.tsx
import React, {useState, useEffect} from 'react';

// --- NEW PROPS INTERFACE ---
interface TimerProps {
    initialTime: number;
    setInitialTime: (time: number) => void;
}
// ---------------------------

// Update component signature
const Timer: React.FC<TimerProps> = ({ initialTime, setInitialTime }) => {
    // initialTime is now a prop
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isTimerRunning && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime(prevSeconds => prevSeconds - 1);
            }, 1000);
        } else if (remainingTime <= 0 && isTimerRunning) {
            // Timer stopped in the builder UI
            setIsTimerRunning(false);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isTimerRunning, remainingTime]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Use the prop setter to update the state in the parent (page.tsx)
        setInitialTime(Number(e.target.value));
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