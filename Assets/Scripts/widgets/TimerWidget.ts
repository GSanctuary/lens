import { PinchButton } from "../../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { InteractorEvent } from "../../SpectaclesInteractionKit/Core/Interactor/InteractorEvent";
import { Timer } from "../types/Sanctuary";
import { CancelToken, clearTimeout, setTimeout } from "../../SpectaclesInteractionKit/Utils/FunctionTimingUtils";

@component
export class TimerWidget extends BaseScriptComponent {
    @input
    timerNameText: Text;

    @input
    timeDisplayText: Text;

    @input
    startButton: PinchButton;

    @input
    pauseButton: PinchButton;

    @input
    resetButton: PinchButton;

    @input
    deleteButton: PinchButton;

    private timer: Timer;
    private updateInterval: CancelToken | undefined;
    private onTimerComplete: (timerId: string) => void;
    private onTimerDelete: (timerId: string) => void;

    onAwake() {
        this.setupButtonCallbacks();
    }

    private setupButtonCallbacks() {
        this.startButton.onButtonPinched.add(this.startTimer.bind(this));
        this.pauseButton.onButtonPinched.add(this.pauseTimer.bind(this));
        this.resetButton.onButtonPinched.add(this.resetTimer.bind(this));
        this.deleteButton.onButtonPinched.add(this.deleteTimer.bind(this));
    }

    initialize(timer: Timer, onComplete: (timerId: string) => void, onDelete: (timerId: string) => void) {
        this.timer = timer;
        this.onTimerComplete = onComplete;
        this.onTimerDelete = onDelete;
        this.updateDisplay();
        this.updateButtonStates();
    }

    private startTimer() {
        if (!this.timer.isRunning && this.timer.remainingTime > 0) {
            this.timer.isRunning = true;
            this.updateButtonStates();
            this.startUpdateInterval();
        }
    }

    private pauseTimer() {
        if (this.timer.isRunning) {
            this.timer.isRunning = false;
            this.updateButtonStates();
            this.stopUpdateInterval();
        }
    }

    private resetTimer() {
        this.timer.remainingTime = this.timer.duration;
        this.timer.isRunning = false;
        this.timer.isCompleted = false;
        this.updateDisplay();
        this.updateButtonStates();
        this.stopUpdateInterval();
    }

    private deleteTimer() {
        this.stopUpdateInterval();
        this.onTimerDelete(this.timer.id);
    }

    private startUpdateInterval() {
        this.updateInterval = setTimeout(() => {
            this.updateTimer();
        }, 1000);
    }

    private stopUpdateInterval() {
        if (this.updateInterval) {
            clearTimeout(this.updateInterval);
            this.updateInterval = undefined;
        }
    }

    private updateTimer() {
        if (this.timer.isRunning && this.timer.remainingTime > 0) {
            this.timer.remainingTime--;
            this.updateDisplay();
            
            if (this.timer.remainingTime <= 0) {
                this.timer.isCompleted = true;
                this.timer.isRunning = false;
                this.updateButtonStates();
                this.stopUpdateInterval();
                this.onTimerComplete(this.timer.id);
            } else {
                this.startUpdateInterval(); // Continue the interval
            }
        }
    }

    private updateDisplay() {
        const minutes = Math.floor(this.timer.remainingTime / 60);
        const seconds = this.timer.remainingTime % 60;
        this.timeDisplayText.text = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerNameText.text = this.timer.name;
    }

    private updateButtonStates() {
        this.startButton.enabled = !this.timer.isRunning && this.timer.remainingTime > 0;
        this.pauseButton.enabled = this.timer.isRunning;
        this.resetButton.enabled = this.timer.remainingTime < this.timer.duration || this.timer.isCompleted;
    }

    getTimer(): Timer {
        return this.timer;
    }

    onDestroy() {
        this.stopUpdateInterval();
    }
} 