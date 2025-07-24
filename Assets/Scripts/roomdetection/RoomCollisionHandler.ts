import { RoomDetectionInterface } from "./RoomDetectionInterface";

@component
export class RoomCollisonHandler extends BaseScriptComponent {
    @input
    collider: ColliderComponent;

    @input
    roomDetectionInterfaceInstance: RoomDetectionInterface;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
        print("created room: " + this.getSceneObject().name);
        this.collider.onOverlapEnter.add((e) => {
            print("overlap entered with room")
            this.roomDetectionInterfaceInstance.roomDetected();
            this.roomDetectionInterfaceInstance.updateCurrentRoom(this.getSceneObject().name);
        });

        this.collider.onOverlapStay.add((e) => {
            this.roomDetectionInterfaceInstance.updateCurrentRoom(this.getSceneObject().name);
        });

        this.collider.onOverlapExit.add((e) => {
            print("overlap exited with room");
            // failsafe
            this.roomDetectionInterfaceInstance.updateCurrentRoom("NONE");
            this.roomDetectionInterfaceInstance.noRoomDetected();
        })
    }
}
