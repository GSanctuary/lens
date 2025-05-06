import { EventType } from "./types/Event";
import { Widget } from "./Widget";

@component
export class EventEmitter extends BaseScriptComponent {
    private static instance: EventEmitter;
    private eventListeners: Record<EventType, Function[]>;
    private widgetRegistry: Record<string, Widget> = {};
    
    onAwake() {
        if (EventEmitter.instance) {
        this.destroy();
        return;
        }
        EventEmitter.instance = this;
        this.eventListeners = {
            [EventType.VoiceInput]: [],
            [EventType.WidgetOpen]: [],
            [EventType.WidgetClose]: []
        };
    }
    
    onDestroy() {
        EventEmitter.instance = null;
    }
    
    emit(eventName: EventType, ...args: any[]) {
        const listeners = this.eventListeners[eventName];
        print(`Emitting event: ${eventName}`);
        if (listeners) {
            for (const listener of listeners) {
                listener(...args);
            }
        }
    }

    registerWidget(widget: Widget) {
        if (!this.widgetRegistry[widget.widgetName]) {
            this.widgetRegistry[widget.widgetName] = widget;
            print(`Widget ${widget.widgetName} registered.`);
        } else {
            print(`Widget ${widget.widgetName} is already registered.`);
        }   
    }
    
    on(eventName: EventType, callback: Function) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
        print(`Event listener registered for event: ${eventName}`);
    }
}