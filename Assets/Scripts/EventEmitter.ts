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
            [WidgetKind.AIConversation]: undefined,
            [WidgetKind.AI]: undefined,
        };

        this.activeWidgets = {
            [WidgetKind.AIConversation]: undefined,
            [WidgetKind.AI]: undefined,
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
        if (!this.instance.isActive) {
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

    static registerWidget(widget: Widget) {
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
