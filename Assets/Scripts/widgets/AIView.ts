import { Widget } from "../Widget";

@component
export class AIView extends Widget {
    @input
    titleText: Text;

    @input
    dateText: Text;

    override open = (args: Record<string, any>) => {
        const { title } = args;
        if (!title) {
            print("Invalid arguments passed to open method");
            return;
        }
        this.titleText.text = title;
    };
}
