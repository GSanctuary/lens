import { EventEmitter } from "../EventEmitter";
import { EventType } from "../types/Event";

@component
export class SpeechToText extends BaseScriptComponent {
    private readonly voiceMlModule =
        require("LensStudio:VoiceMLModule") as VoiceMLModule;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        const options = VoiceML.ListeningOptions.create();
        options.shouldReturnInterimAsrTranscription = false;
        options.shouldReturnAsrTranscription = true;

        this.voiceMlModule.onListeningEnabled.add(() => {
            this.voiceMlModule.startListening(options);
        });
        this.voiceMlModule.onListeningDisabled.add(() => {
            this.voiceMlModule.stopListening();
        });
        this.voiceMlModule.onListeningError.add((event) => {
            print(`${event.error}: ${event.description}`);
        });
        this.voiceMlModule.onListeningUpdate.add((event) => {
            if (event.transcription) {
                EventEmitter.getInstance().emit(
                    EventType.VoiceInput,
                    event.transcription
                );
            }
        });
    }
}
