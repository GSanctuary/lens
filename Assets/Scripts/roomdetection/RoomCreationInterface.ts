import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { RoomScanInterface } from "./RoomScanInterface";
import { VoicePrefixHandler } from "../utils/VoicePrefixHandler";

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
    roomPrefab: ObjectPrefab;

    @input
    room: SceneObject;

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
        print("center: " + this.scannedData[0] + " scale X: " + this.scannedData[1] + " scale z: " + this.scannedData[2] + " yaw deg: " + this.scannedData[3]);
        const newRoom = this.roomPrefab.instantiate(this.room);
        newRoom.enabled = true;
        newRoom.getTransform().setWorldPosition(this.scannedData[0]);
        newRoom.getTransform().setWorldScale(new vec3(this.scannedData[1]/4, 10, this.scannedData[2]/4));
        newRoom.getTransform().setLocalRotation(quat.fromEulerAngles(0,this.scannedData[3],0))
    }

    protected onBackButton() {
        this.deactivate();
        this.roomScannerInstance.activateAndPlace(this.roomCreationInterfaceContainer.getSceneObject().getTransform().getWorldPosition());
    }
}
