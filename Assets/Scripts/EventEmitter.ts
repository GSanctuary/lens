import { EventType } from "./types/Event";
import { WidgetKind } from "./types/WidgetKind";
import { Widget } from "./Widget";

@component
export class EventEmitter extends BaseScriptComponent {
    private static instance: EventEmitter;
    private eventListeners: Record<EventType, Function[]>;
    private widgetRegistry: Record<WidgetKind, Widget>;

    private isActive: boolean = false;

    onAwake() {
        if (EventEmitter.instance) {
            this.destroy();
            return;
        }
        EventEmitter.instance = this;
        this.eventListeners = {
            [EventType.VoiceInput]: [],
            [EventType.WidgetOpen]: [],
            [EventType.WidgetClose]: [],
        };
        this.widgetRegistry = {
            [WidgetKind.AIConversation]: null,
            [WidgetKind.AI]: null,
        };
    }

    onDestroy() {
        EventEmitter.instance = null;
    }

    static getInstance(): EventEmitter {
        if (!EventEmitter.instance) {
            throw new Error("EventEmitter instance not initialized");
        }
        return EventEmitter.instance;
    }

    activate() {
        this.isActive = true;
        print("EventEmitter activated.");
    }

    emit(eventName: EventType, ...args: any[]) {
        if (!this.isActive) {
            print(
                `EventEmitter is not active. Event ${eventName} not emitted.`
            );
            return;
        }
        const listeners = this.eventListeners[eventName];
        print(`Emitting event: ${eventName}`);
        if (listeners) {
            for (const listener of listeners) {
                listener(...args);
            }
        }
    }

    registerWidget(widget: Widget) {
        try {
            if (!this.widgetRegistry[widget.kind]) {
                print("this branch");
                this.widgetRegistry[widget.kind] = widget;
                print(`Widget ${widget.kind} registered.`);
            } else {
                print(`Widget ${widget.kind} is already registered.`);
            }
        } catch (error) {
            print(`Error registering widget: ${error}`);
        }
    }

    openWidget = (widgetKind: WidgetKind, ...args: any[]) => {
        const widget = this.widgetRegistry[widgetKind];
        if (widget) {
            widget.open(...args);
        } else {
            print(`Widget ${widgetKind} not found.`);
        }
    };

    on(eventName: EventType, callback: Function) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
        print(`Event listener registered for event: ${eventName}`);
    }
}
