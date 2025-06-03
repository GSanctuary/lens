import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { StickyNote } from "../types/Sanctuary";
import { TextDisplay } from "./TextDisplay";

type Metadata = {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
};

type RenderedNote = {
    note: StickyNote;
    display: SceneObject;
};

@component
export class StickyNoteWidget extends Widget {
    @input
    createStickyNoteButton: PinchButton;

    @input
    textDisplayPrefab: ObjectPrefab;

    private stickyNotes: StickyNote[] = [];
    private renderedNotes: RenderedNote[] = [];

    override onAwake(): void {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
        this.createEvent("TurnOffEvent").bind(() => this.onTurnOff());
    }

    override async onStart(): Promise<void> {
        super.onStart();
    }

    protected override async hydrate(): Promise<void> {
        this.stickyNotes = await SanctuaryAPI.getStickyNotes();

        for (const note of this.stickyNotes) {
            if (!this.validateMetadata(note.metadata)) continue;
            this.renderNote(note);
        }
    }

    private onTurnOff(): void {
        print("Turning off StickyNoteWidget");
    }

    private validateMetadata(metadata: Record<string, any>): boolean {
        if (!metadata || typeof metadata !== "object") {
            return false;
        }
        const requiredKeys = ["position", "rotation", "scale"];
        for (const key of requiredKeys) {
            if (
                !metadata.hasOwnProperty(key) ||
                typeof metadata[key] !== "object"
            ) {
                return false;
            }

            const subKeys = ["x", "y", "z"];
            for (const subKey of subKeys) {
                if (
                    !metadata[key].hasOwnProperty(subKey) ||
                    typeof metadata[key][subKey] !== "number"
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    private renderNote(note: StickyNote): void {
        const stickyNoteDisplay = this.textDisplayPrefab.instantiate(null);
        const transform = stickyNoteDisplay.getTransform();
        const metadata = note.metadata as Metadata;

        transform.setLocalPosition(
            new vec3(
                metadata.position.x,
                metadata.position.y,
                metadata.position.z
            )
        );

        transform.setLocalRotation(
            new quat(
                metadata.rotation.x,
                metadata.rotation.y,
                metadata.rotation.z,
                1 // Assuming no rotation around w-axis
            )
        );

        transform.setLocalScale(
            new vec3(metadata.scale.x, metadata.scale.y, metadata.scale.z)
        );

        const textDisplay = stickyNoteDisplay.getComponent(
            TextDisplay.getTypeName()
        );
        if (!textDisplay) {
            throw new Error(
                "TextDisplay component not found on sticky note prefab"
            );
        }
        textDisplay.text.text = note.content;
        textDisplay.onClose.bind(() => {
            this.removeNote(note.id);
        });

        this.renderedNotes.push({
            note,
            display: stickyNoteDisplay,
        });
    }

    private async removeNote(noteId: number): Promise<void> {
        await SanctuaryAPI.deleteStickyNote(noteId);
        this.stickyNotes = this.stickyNotes.filter(
            (note) => note.id !== noteId
        );
    }
}
