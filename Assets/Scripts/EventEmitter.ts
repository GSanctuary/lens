import { Widget } from "./Widget";

@component
export class EventEmitter extends BaseScriptComponent {
    private static instance: EventEmitter;
    private eventListeners: Record<Event, Function[]>;
    private widgetRegistry: Record<string, Widget> = {};
    
    onAwake() {
        if (EventEmitter.instance) {
        this.destroy();
        return;
        }
        EventEmitter.instance = this;
    }
    
    onDestroy() {
        EventEmitter.instance = null;
    }
    
    emit(eventName: Event, ...args: any[]) {
        const listeners = this.eventListeners[eventName];
        if (listeners) {
            for (const listener of listeners) {
                listener(...args);
            }
        }
    }

    registerWidget(widget: Widget) {
        if (!this.widgetRegistry[widget.widgetName]) {
            this.widgetRegistry[widget.widgetName] = widget;
        } else {
            print(`Widget ${widget.widgetName} is already registered.`);
        }   
    }
    
    on(eventName: string, callback: Function) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
}