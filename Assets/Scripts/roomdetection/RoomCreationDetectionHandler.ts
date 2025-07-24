import {
  AnchorSession,
  AnchorSessionOptions,
} from 'Spatial Anchors.lspkg/AnchorSession';

import { Anchor } from 'Spatial Anchors.lspkg/Anchor';
import { AnchorComponent } from 'Spatial Anchors.lspkg/AnchorComponent';
import { AnchorModule } from 'Spatial Anchors.lspkg/AnchorModule';

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
  }

  public onAnchorNearby(anchor: Anchor) {
    print('Anchor found: ' + anchor.id);
    //this.attachNewObjectToAnchor(anchor);
  }

  async createRoom(scanData: [vec3, number, number, number], name: string) {
    const anchorPos = scanData[0];

    // Compute the anchor position
    let anchorPosition = mat4.fromTranslation(anchorPos);

    // Create the anchor
    let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);
    
    // TODO: anchor id to go to backend
    print(anchor.id);

    // Create the object and attach it to the anchor
    this.associatePrefabWithRoomAnchor(anchor, scanData);

    // Save the anchor so it's loaded in future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
    } catch (error) {
      print('Error saving anchor: ' + error);
    }
  }

  private onExistingRoomDetected(anchor: Anchor) {
    // call backend for data and call below method

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
}
}