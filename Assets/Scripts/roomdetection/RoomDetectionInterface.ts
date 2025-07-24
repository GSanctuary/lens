import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { RoomScanInterface } from "./RoomScanInterface";

@component
export class RoomDetectionInterface extends BaseScriptComponent {
    @input 
    private roomDetectionInterfaceContainer: ContainerFrame;

    @input
    currentRoomText: Text;

    @input
    roomScanInstance: RoomScanInterface;

    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {this.onStart();});
    }

    onStart() {
        this.roomDetectionInterfaceContainer.getSceneObject().enabled = false;
    }

    activateAndPlace(position: vec3) {
        // position stuff
        const frameTransform = this.roomDetectionInterfaceContainer.getSceneObject().getTransform();
        const placePosition = position;

        frameTransform.setWorldPosition(placePosition);

        // activate
        this.roomDetectionInterfaceContainer.getSceneObject().enabled = true;
        this.roomDetectionInterfaceContainer.enabled = true;
        this.roomDetectionInterfaceContainer.setIsFollowing(true);
    }

    protected deactivate() {
        this.roomDetectionInterfaceContainer.getSceneObject().enabled = false;
        print('Room Detection Interface Deactivated');
    }

    updateCurrentRoom(text: string){
        this.currentRoomText.text = text;
    }

    roomDetected() {
        this.activateAndPlace(this.roomScanInstance.roomScanInterfaceContainer.getSceneObject().getTransform().getWorldPosition())
        this.roomScanInstance.endScanAndDeactivate();
    }

    noRoomDetected() {
        this.deactivate();
        this.roomScanInstance.activateAndPlace(this.roomDetectionInterfaceContainer.getSceneObject().getTransform().getWorldPosition());
    } 
}
