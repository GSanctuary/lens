import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { Widget } from "../Widget";
import { Scanner } from "./Scanner";

@component
export class RoomScanInterface extends BaseScriptComponent {
    private allowEndScan: boolean;

    @input
    roomScanInterfaceContainer: SceneObject;

    @input
    beginScanButton: PinchButton;

    @input
    endScanButton: PinchButton;

    @input
    scanAccuracyText: Text;

    @input 
    scannerUnit: Scanner;

    onAwake() {
      // setup default button states
      this.allowEndScan = false;
      this.createEvent('UpdateEvent').bind(this.onUpdate.bind(this));
      this.createEvent("OnStartEvent").bind(() => this.onStart());
    }

    onStart() {
      this.beginScanButton.onButtonPinched.add(this.onScanButton.bind(this));
      this.endScanButton.onButtonPinched.add(this.onEndScanButton.bind(this));
    }

    onScanButton() {
      this.scannerUnit.startScan();
      this.allowEndScan = true;
    }
    
    onEndScanButton() {
      if(this.allowEndScan){
        this.scannerUnit.endScan();
      }else{
        print('Error: you must start a scan first before pressing end scan')
      }
      this.allowEndScan = false;
    }

    onUpdate() {
      this.scanAccuracyText.text = this.allowEndScan ? this.scannerUnit.getScanPercentage().toString() : 'scan accuracy';
    }
}
