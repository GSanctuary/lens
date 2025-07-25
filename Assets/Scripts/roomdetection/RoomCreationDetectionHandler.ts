import {
  AnchorSession,
  AnchorSessionOptions,
} from 'Spatial Anchors.lspkg/AnchorSession';

import { Anchor } from 'Spatial Anchors.lspkg/Anchor';
import { AnchorComponent } from 'Spatial Anchors.lspkg/AnchorComponent';
import { AnchorModule } from 'Spatial Anchors.lspkg/AnchorModule';
import { PersistentStorageManager } from '../utils/PersistentStorageManager';
import { SanctuaryAPI } from '../services/SanctuaryAPI';
import { Room } from '../types/Sanctuary';

@component
export class RoomCreationDetectionHandler extends BaseScriptComponent {
  @input anchorModule: AnchorModule;

  @input
  roomPrefab: ObjectPrefab;

  private anchorSession?: AnchorSession;

  async onAwake() {
    this.createEvent('OnStartEvent').bind(() => {
      this.onStart();
    });
  }

  async onStart() {
    // Set up the AnchorSession options to scan for World Anchors
    const anchorSessionOptions = new AnchorSessionOptions();
    anchorSessionOptions.scanForWorldAnchors = true;

    // Start scanning for anchors
    this.anchorSession =
      await this.anchorModule.openSession(anchorSessionOptions);

    // Listen for nearby anchors
    this.anchorSession.onAnchorNearby.add(this.onAnchorNearby.bind(this));

    // Set current room to "NONE"
    PersistentStorageManager.getInstance().set("currentRoom", "NONE");
  }

  public async onAnchorNearby(anchor: Anchor) {
    print('Anchor found: ' + anchor.id);
    try {
        const room = await SanctuaryAPI.getRoom(anchor.id);
        const pos = new vec3(room.position[0],room.position[1],room.position[2]);
        const scaleX = room.scale[0];
        const scaleZ = room.scale[1];
        const rotationDegrees = room.rotation;
        this.associatePrefabWithRoomAnchor(anchor, [pos, scaleX, scaleZ, rotationDegrees]);
    } catch (error) {
        print("Error getting room: " + error);
        throw error; 
    }
  }

  // TODO: Add naming functionality
  async createRoom(scanData: [vec3, number, number, number], name: string) {
    const anchorPos = scanData[0];

    // Compute the anchor position
    let anchorPosition = mat4.fromTranslation(anchorPos);

    // Create the anchor
    let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);

    const roomData: Room = {
        position: [scanData[0].x, scanData[0].y, scanData[0].z],
        scale: [scanData[1], scanData[2]], // Ensure these are numbers, not arrays
        name: anchor.id,
        anchorId: anchor.id,
        rotation: scanData[3],
        widgets: {
            aiConversations: [],
            recipes: [],
            task: [],
            stickyNotes: []
        }
    };
    
    // Save room data to backend
    SanctuaryAPI.createRoom(roomData);
    print("Data for room " + anchor.id + " saved to backend")

    // Create the object and attach it to the anchor
    this.associatePrefabWithRoomAnchor(anchor, scanData);

    // Save the anchor so it's loaded in future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
    } catch (error) {
      throw new Error('Error saving anchor: ' + error);
    }
  }

  private associatePrefabWithRoomAnchor(anchor: Anchor, data: [vec3, number, number, number]) {
    // Create a wrapper object
    const roomWrapper = global.scene.createSceneObject("RoomWrapper");
    
    // Set anchor component
    let anchorComponent = roomWrapper.createComponent(
        AnchorComponent.getTypeName()
    ) as AnchorComponent;
    anchorComponent.anchor = anchor;
    
    // Instantiate the prefab as a child of the wrapper
    const newRoom = this.roomPrefab.instantiate(roomWrapper);
    newRoom.enabled = true;
    newRoom.getChild(0).name = anchor.id;
    
    // Apply transforms to child
    newRoom.getTransform().setLocalPosition(new vec3(0,-42,0)); // Keep at anchor position
    newRoom.getTransform().setLocalScale(new vec3(data[1]/9, 28, data[2]/9));
    newRoom.getTransform().setLocalRotation(quat.fromEulerAngles(0, data[3], 0));
    print("Room with id " + anchor.id + " associated/reassociated")
}
}