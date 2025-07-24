import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { RoomScanInterface } from "./RoomScanInterface";
import { VoicePrefixHandler } from "../utils/VoicePrefixHandler";
import { RoomCreationDetectionHandler } from "./RoomCreationDetectionHandler";
import { RoomDetectionInterface } from "./RoomDetectionInterface";

@component
export class RoomCreationInterface extends BaseScriptComponent {
    private scannedData: [vec3, number, number, number];

    @input
    roomCreationInterfaceContainer: ContainerFrame;

    @input 
    confirmButton: PinchButton;

    @input 
    backButton: PinchButton;

    @input
    roomScannerInstance: RoomScanInterface;

    @input
    roomDetectionInstance: RoomDetectionInterface;

    @input
    roomDetectionCreationHandlerInstance: RoomCreationDetectionHandler;

    @input
    camera: Camera;

    onAwake() {
        this.roomCreationInterfaceContainer.getSceneObject().enabled = false;
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        this.confirmButton.onButtonPinched.add(this.onConfirmButton.bind(this));
        this.backButton.onButtonPinched.add(this.onBackButton.bind(this));
    }

    activateAndPlaceWithData(data: [vec3, number, number, number], position: vec3) {
        // position stuff
        const frameTransform = this.roomCreationInterfaceContainer.getSceneObject().getTransform();
        const placePosition = position;

        // pass in last scanner output
        this.scannedData = data;

        // activate
        this.roomCreationInterfaceContainer.getSceneObject().enabled = true;
        this.roomCreationInterfaceContainer.enabled = true;
        this.roomCreationInterfaceContainer.setIsFollowing(true);

        frameTransform.setWorldPosition(placePosition);
    }

    protected deactivate() {
        this.roomCreationInterfaceContainer.getSceneObject().enabled = false;
        print('Room Creation Interface Deactivated');
    }

    protected onConfirmButton() {
        this.roomDetectionCreationHandlerInstance.createRoom(this.scannedData, "testRoom");
        this.deactivate();
        this.roomDetectionInstance.activateAndPlace(this.roomCreationInterfaceContainer.getSceneObject().getTransform().getWorldPosition());
        this.roomDetectionInstance.updateCurrentRoom("TEST")
    }

    protected onBackButton() {
        this.deactivate();
        this.roomScannerInstance.activateAndPlace(this.roomCreationInterfaceContainer.getSceneObject().getTransform().getWorldPosition());
    }
}
