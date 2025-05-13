import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { Conversation } from "../types/Sanctuary";
import { AIConversationItem } from "./AIConversationItem";

@component
export class RenderConversation extends BaseScriptComponent {
    @input
    textPrefab!: ObjectPrefab;

    onAwake() {
        print("on awake");
        try {
            const yStart = 0;
            const yOffset = -5.4;
            print("Updating UI");
            for (let i = 0; i < 10; i++) {
                const item = this.textPrefab.instantiate(this.getSceneObject());
                const screenTransform = item.getComponent(
                    "Component.ScreenTransform"
                );
                screenTransform.offsets.setCenter(
                    new vec2(0, yStart + yOffset * i)
                );
                item.enabled = true;
            }
        } catch (error) {
            print(`Error updating UI: ${error}`);
        }
    }
}
