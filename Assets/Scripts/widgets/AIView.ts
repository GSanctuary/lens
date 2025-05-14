import { Conversation } from "../types/Sanctuary";
import { Widget } from "../Widget";

@component
export class AIView extends Widget {
    @input
    titleText: Text;

    @input
    inputText: Text;

    private conversation: Conversation;

    override open = (args: Record<string, any>) => {
        const { title } = args;
        if (!title) {
            print("Invalid arguments passed to open method");
            return;
        }
        this.titleText.text = title;
        this.conversation = args as Conversation;
    };

    protected override handleVoiceInput = (input: string) => {
        print(`Handling voice input in AIView: ${input}`);
        this.inputText.text = input;
    };
}
