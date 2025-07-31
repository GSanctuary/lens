import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { SanctuaryAPI } from "../services/SanctuaryAPI";
import { StickyNote } from "../types/Sanctuary";
import { TextDisplay } from "./TextDisplay";
import { RemoveMethod, VoicePrefixHandler } from "../utils/VoicePrefixHandler";
import { PersistentStorageManager } from "../utils/PersistentStorageManager";

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

    @input
    initialText: string = "Say 'Note ...'";

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
        this.voicePreviewText.text = this.initialText;
    }

    override open(args: Record<string, any>): Widget {
        if (this.renderedNotes.length > 0) {
            this.toggleStickyNotes();
        } else {
            this.hydrate();
        }
        return super.open(args);
    }

    override close(): Widget {
        this.syncStickyNotes();
        this.toggleStickyNotes();
        return super.close();
    }

    protected override async hydrate(): Promise<void> {
        this.stickyNotes = await SanctuaryAPI.getStickyNotes();

        for (const note of this.stickyNotes) {
            if (!this.validateMetadata(note.metadata)) continue;
            this.renderNote(note, note.metadata as Metadata);
        }
    }

    

    private async syncStickyNotes(): Promise<void> {
        for (const renderedNote of this.renderedNotes) {
            const transform = renderedNote.display.getTransform();
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
            await SanctuaryAPI.updateStickyNote(
                renderedNote.note.id,
                renderedNote.note.content,
                metadata
            );
            print(
                `Updated sticky note with ID: ${
                    renderedNote.note.id
                } and metadata: ${JSON.stringify(metadata)}`
            );
        }
    }

    private async onTurnOff(): Promise<void> {
        await this.syncStickyNotes();
    }

    private toggleStickyNotes(): void {
        for (const note of this.renderedNotes) {
            const display = note.display;
            display.enabled = !display.enabled;
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
            anchorId: PersistentStorageManager.getInstance().get("currentRoom"), 
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
        SanctuaryAPI.createStickyNote(content, metadata, PersistentStorageManager.getInstance().get("currentRoom")) 
            .then((createdNote) => {
                newNote.id = createdNote.id; // Update the ID with the one from the API
                newNote.userId = createdNote.userId; // Update the user ID
                this.renderNote(newNote, metadata);
                this.voicePreviewText.text = this.initialText; // Reset the input text
            })
            .catch((error) => {
                print(`Error creating sticky note: ${error}`);
            });
    }

    private closeStickyNote(noteId: number): () => void {
        return () => {
            print(`Closing sticky note with ID: ${noteId}`);
            this.removeNote(noteId);
        };
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

        textDisplay.onClose.add(this.closeStickyNote(note.id).bind(this));

        this.renderedNotes.push({
            note,
            display: textDisplay.containerFrame.getSceneObject(),
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
        this.renderedNotes = this.renderedNotes.filter(
            (renderedNote) => renderedNote.note.id !== noteId
        );
    }
}
