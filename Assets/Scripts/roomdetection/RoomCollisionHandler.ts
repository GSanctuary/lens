import { PersistentStorageManager } from "../utils/PersistentStorageManager";
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
        const roomAnchorID = this.getSceneObject().name;
        print("Collision handler for room with id " + this.getSceneObject().name + " associated");
        this.collider.onOverlapEnter.add((e) => {
            // on overlap enter open room detection and set current room within persistent storage
            print("overlap entered with room: " + roomAnchorID)
            this.roomDetectionInterfaceInstance.roomDetected();
            this.roomDetectionInterfaceInstance.updateCurrentRoom(roomAnchorID);
            PersistentStorageManager.getInstance().set("currentRoom", roomAnchorID);
        });

        this.collider.onOverlapStay.add((e) => {
            this.roomDetectionInterfaceInstance.updateCurrentRoom(roomAnchorID);
        });

        this.collider.onOverlapExit.add((e) => {
            print("overlap exited with room: " + roomAnchorID);
            // failsafe
            this.roomDetectionInterfaceInstance.updateCurrentRoom("NONE");
            
            // on overlap exit open room scanner and set current room to none
            this.roomDetectionInterfaceInstance.noRoomDetected();
            PersistentStorageManager.getInstance().set("currentRoom", "NONE");
        })
    }
}
