import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { Scanner } from "./Scanner";
import { RoomCreationInterface } from "./RoomCreationInterface";
import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { RoomDetectionInterface } from "./RoomDetectionInterface";

@component
export class RoomScanInterface extends BaseScriptComponent {
    private allowEndScan: boolean;

    @input
    roomScanInterfaceContainer: ContainerFrame;

    @input
    beginScanButton: PinchButton;

    @input
    endScanButton: PinchButton;

    @input
    backButton: PinchButton;

    @input
    scanAccuracyText: Text;

    @input 
    scannerUnit: Scanner;

    @input
    roomCreationInstace: RoomCreationInterface;

    @input
    roomDetectionInstance: RoomDetectionInterface;

    @input
    camera: Camera;

    onAwake() {
      // set up events and scanner bool
      this.allowEndScan = false;
      this.createEvent('UpdateEvent').bind(this.onUpdate.bind(this));
      this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
      this.roomScanInterfaceContainer.getSceneObject().enabled = true;
      this.beginScanButton.onButtonPinched.add(this.onScanButton.bind(this));
      this.endScanButton.onButtonPinched.add(this.onEndScanButton.bind(this));
    }

    activateAndPlace(position: vec3) {
        // position stuff
        const frameTransform = this.roomScanInterfaceContainer.getSceneObject().getTransform();
        const placePosition = position;

        // scanner stuff
        this.allowEndScan = false;

        // activate and set follow
        this.roomScanInterfaceContainer.getSceneObject().enabled = true;
        this.roomScanInterfaceContainer.enabled = true;
        this.roomScanInterfaceContainer.setIsFollowing(true);

        frameTransform.setWorldPosition(placePosition);
    }

    endScanAndDeactivate() {
      if(this.allowEndScan){
        this.scannerUnit.endScan();
      }
      this.roomScanInterfaceContainer.getSceneObject().enabled = false;
      print('Room Scan Interface Deactivated')
    }

    protected onScanButton() {
      this.scannerUnit.startScan();
      this.allowEndScan = true;
    }
    
    protected onEndScanButton() {
      if(this.allowEndScan){
        this.endScanAndDeactivate();
        this.roomCreationInstace.activateAndPlaceWithData(this.scannerUnit.getFinalScanData(), this.roomScanInterfaceContainer.getSceneObject().getTransform().getWorldPosition());
      }else{
        print('Error: you must start a scan first before pressing end scan')
      }
      this.allowEndScan = false;
    }

    protected onBackButton() {
      this.endScanAndDeactivate();
      this.roomDetectionInstance.activateAndPlace(this.roomScanInterfaceContainer.getSceneObject().getTransform().getWorldPosition());
    }

    onUpdate() {
      const scanAccuracy = this.scannerUnit.getScanPercentage().toString();
      this.scanAccuracyText.text = this.allowEndScan ? scanAccuracy == "NaN" ? "No data yet" : "Scan deviation: " + scanAccuracy : 'scan accuracy';
    }
}
