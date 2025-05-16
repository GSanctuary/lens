import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { Conversation } from "../types/Sanctuary";
import { Widget } from "../Widget";

@component
export class AIView extends Widget {
    @input
    titleText: Text;

    @input
    inputText: Text;

    @input
    outputText: Text;

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
        this.inputText.text = input;
        this.sendToAPI(input);
        this.outputText.text = "Thinking...";
    };

    private sendToAPI = async (input: string) => {
        if (!this.conversation) {
            throw new Error("Conversation is not set");
        }
        try {
            const response = await SanctuaryAPI.getInstance().completion(
                this.conversation.id,
                input
            );
            print(`Response: ${response.response}`);
            this.outputText.text = response.response;
        } catch (error) {
            print(`Error sending message: ${error}`);
        }
    };
}
