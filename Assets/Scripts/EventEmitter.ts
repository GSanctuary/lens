import { EventType } from "./types/Event";
import { WidgetKind } from "./types/WidgetKind";
import { Widget } from "./Widget";

@component
export class EventEmitter extends BaseScriptComponent {
    private static instance: EventEmitter;
    private eventListeners: Record<EventType, Function[]>;
    private widgetRegistry: Record<WidgetKind, Widget>;

    private activeWidgets: Record<WidgetKind, Widget | undefined>;

    private isActive: boolean = false;

    // Events that should run regardless of EE activation state
    private privilegedEvents: EventType[] = [EventType.WidgetRegistered];

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
            [EventType.TaskCreated]: [],
            [EventType.WidgetRegistered]: [],
        };
        this.widgetRegistry = {
            [WidgetKind.AIConversation]: undefined,
            [WidgetKind.AI]: undefined,
            [WidgetKind.TaskList]: undefined,
            [WidgetKind.TaskCreation]: undefined,
            [WidgetKind.Note]: undefined,
            [WidgetKind.CookingAssistant]: undefined,
            [WidgetKind.Weather]: undefined,
        };

        this.activeWidgets = {
            [WidgetKind.AIConversation]: undefined,
            [WidgetKind.AI]: undefined,
            [WidgetKind.TaskList]: undefined,
            [WidgetKind.TaskCreation]: undefined,
            [WidgetKind.Note]: undefined,
            [WidgetKind.CookingAssistant]: undefined,
            [WidgetKind.Weather]: undefined,
        };

        EventEmitter.on(EventType.WidgetOpen, this.openWidget.bind(this));
        EventEmitter.on(EventType.WidgetClose, this.closeWidget.bind(this));
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

    static activate() {
        this.instance.isActive = true;
        print("EventEmitter activated.");
    }

    static emit(eventName: EventType, ...args: any[]) {
        if (!this.shouldEmit(eventName)) {
            print(
                `EventEmitter is not active. Event ${eventName} not emitted.`
            );
            return;
        }
        const listeners = this.instance.eventListeners[eventName];
        print(`Emitting event: ${eventName}`);
        if (listeners) {
            for (const listener of listeners) {
                listener(...args);
            }
        }
    }

    static registerWidget(widget: Widget, includeInWidgetList: boolean = true) {
        try {
            if (!this.instance.widgetRegistry[widget.kind]) {
                this.instance.widgetRegistry[widget.kind] = widget;
                print(`Widget ${widget.kind} registered.`);
            } else {
                print(`Widget ${widget.kind} is already registered.`);
            }
        } catch (error) {
            print(`Error registering widget: ${error}`);
        }

        if (!includeInWidgetList) return;
        EventEmitter.emit(
            EventType.WidgetRegistered,
            widget.kindString,
            widget.kind
        );
    }

    private static shouldEmit(eventType: EventType): boolean {
        return (
            this.instance.isActive ||
            this.instance.privilegedEvents.includes(eventType)
        );
    }

    private openWidget(widgetKind: WidgetKind, args: Record<string, any>) {
        const widget = this.widgetRegistry[widgetKind];
        if (widget) {
            widget.open(args);
            this.activeWidgets[widgetKind] = widget;
        } else {
            print(`Widget ${widgetKind} not found.`);
        }
    }

    private closeWidget(widgetKind: WidgetKind) {
        print(`Closing widget: ${widgetKind}`);
        this.activeWidgets[widgetKind] = undefined;
    }

    static on(eventName: EventType, callback: Function) {
        if (!this.instance.eventListeners[eventName]) {
            this.instance.eventListeners[eventName] = [];
        }
        this.instance.eventListeners[eventName].push(callback);
        print(`Event listener registered for event: ${eventName}`);
    }
}
