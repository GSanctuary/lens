import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { StickyNote } from "../types/Sanctuary";
import { TextDisplay } from "./TextDisplay";
import { RemoveMethod, VoicePrefixHandler } from "../utils/VoicePrefixHandler";

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
    voicePreviewText: Text;

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
        this.registerEventHandlers();
        this.createStickyNoteButton.onButtonPinched.add(
            this.createStickyNote.bind(this)
        );
    }

    protected override async hydrate(): Promise<void> {
        this.stickyNotes = await SanctuaryAPI.getStickyNotes();

        for (const note of this.stickyNotes) {
            if (!this.validateMetadata(note.metadata)) continue;
            this.renderNote(note, note.metadata as Metadata);
        }
    }

    protected override setupVoicePrefixHandler(): VoicePrefixHandler {
        return new VoicePrefixHandler(
            this.kindString,
            RemoveMethod.RemoveBefore
        );
    }

    protected override handleVoiceInputCallback(input: string): void {
        this.voicePreviewText.text = input;
    }

    private async onTurnOff(): Promise<void> {
        for (const renderedNote of this.renderedNotes) {
            await SanctuaryAPI.createStickyNote(renderedNote.note.content, {
                position: renderedNote.display
                    .getTransform()
                    .getLocalPosition(),
                rotation: renderedNote.display
                    .getTransform()
                    .getLocalRotation(),
                scale: renderedNote.display.getTransform().getLocalScale(),
            } as Metadata);
        }
    }

    private createStickyNote(): void {
        const content = this.voicePreviewText.text.trim();

        print(`Creating sticky note with content: ${content}`);

        const newNote: StickyNote = {
            id: Date.now(), // Temporary ID, will be replaced by API
            content: content,
            metadata: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: -1, // Temporary user ID, will be replaced by API
        };
        this.stickyNotes.push(newNote);

        const transform = this.frame.getTransform();
        const position = transform.getWorldPosition();
        const rotation = transform.getWorldRotation();
        const scale = transform.getWorldScale();
        const metadata: Metadata = {
            position: {
                x: position.x,
                y: position.y,
                z: position.z,
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z,
            },
            scale: {
                x: scale.x,
                y: scale.y,
                z: scale.z,
            },
        };
        this.renderNote(newNote, metadata);
        this.voicePreviewText.text = "Say 'Note ...'"; // Clear the preview text
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

    private renderNote(note: StickyNote, metadata: Metadata): void {
        print(`Rendering note: ${JSON.stringify(metadata)}`);
        const stickyNoteDisplay = this.textDisplayPrefab.instantiate(null);
        const transform = stickyNoteDisplay.getTransform();

        transform.setWorldPosition(
            new vec3(
                metadata.position.x,
                metadata.position.y,
                metadata.position.z
            )
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
        textDisplay.enableContainerFrame();
        textDisplay.setFramePosition(
            new vec3(
                metadata.position.x,
                metadata.position.y,
                metadata.position.z
            )
        );

        this.renderedNotes.push({
            note,
            display: stickyNoteDisplay,
        });

        print(
            `Instantiated coords: ${JSON.stringify({
                position: {
                    x: transform.getWorldPosition().x,
                    y: transform.getWorldPosition().y,
                    z: transform.getWorldPosition().z,
                },
                rotation: {
                    x: transform.getWorldRotation().x,
                    y: transform.getWorldRotation().y,
                    z: transform.getWorldRotation().z,
                },
                scale: {
                    x: transform.getWorldScale().x,
                    y: transform.getWorldScale().y,
                    z: transform.getWorldScale().z,
                },
            })}`
        );

        print(`Rendered note: ${JSON.stringify(metadata)}`);
    }

    private async removeNote(noteId: number): Promise<void> {
        await SanctuaryAPI.deleteStickyNote(noteId);
        this.stickyNotes = this.stickyNotes.filter(
            (note) => note.id !== noteId
        );
    }
}
