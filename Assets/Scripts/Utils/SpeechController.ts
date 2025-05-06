import { EventEmitter } from "../EventEmitter";

@component
export class SpeechToText extends BaseScriptComponent {

  @input eventEmitter: EventEmitter;

  private readonly voiceMlModule =
    require('LensStudio:VoiceMLModule') as VoiceMLModule;

  onAwake() {
    this.createEvent('OnStartEvent').bind(() => this.onStart());
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
        print(event.transcription);
        this.eventEmitter.emit(Event.VoiceInput, event.transcription);
      }
    });
  }
}
