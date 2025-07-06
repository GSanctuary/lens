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

  @input prefab: ObjectPrefab;

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
    const roomRotationDeg = scanData[1];
    const roomScaleX = scanData[2];
    const roomScaleY = scanData[3];

    // Compute the anchor position 5 units in front of user
    let anchorPosition = mat4.fromTranslation(anchorPos);

    // Create the anchor
    let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);
    
    // TODO: anchor id to go to backend
    print(anchor.id);

    // Create the object and attach it to the anchor
    //this.createNewRoom(anchor);

    // Save the anchor so it's loaded in future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
    } catch (error) {
      print('Error saving anchor: ' + error);
    }
  }

  private onExistingRoomDetected(anchor: Anchor) {}

  private createNewRoom(anchor: Anchor) {
    // Create a new object from the prefab
    let object: SceneObject = this.prefab.instantiate(this.getSceneObject());
    object.setParent(this.getSceneObject());

    // Associate the anchor with the object by adding an AnchorComponent to the
    // object and setting the anchor in the AnchorComponent.
    let anchorComponent = object.createComponent(
      AnchorComponent.getTypeName()
    ) as AnchorComponent;
    anchorComponent.anchor = anchor;
  }
}