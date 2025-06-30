// import required modules
const WorldQueryModule = require('LensStudio:WorldQueryModule');
const SIK = require('SpectaclesInteractionKit/SIK').SIK;
const InteractorTriggerType =
  require('SpectaclesInteractionKit/Core/Interactor/Interactor').InteractorTriggerType;
const InteractorInputType =
  require('SpectaclesInteractionKit/Core/Interactor/Interactor').InteractorInputType;

@component
export class Scanner extends BaseScriptComponent {
  private totalPositions = new vec3(0,0,0);
  private numHits = 0; 
  private scanning = false;
  private raycastTiming = 500; // ms
  private hitTestSession;
  private primaryInteractor;
  private cameraTransform: Transform;

  @input
  filterEnabled: boolean;

  @input
  camera: Camera;

  onAwake() {
    // create new hit session
    this.hitTestSession = this.createHitTestSession(this.filterEnabled);
    this.cameraTransform = this.camera.getSceneObject().getTransform();
  }

  createHitTestSession(filterEnabled) {
    // create hit test session with options
    var options = HitTestSessionOptions.create();
    options.filter = filterEnabled;

    var session = WorldQueryModule.createHitTestSessionWithOptions(options);
    return session;
  }

  onHitTestResult(results) {
    if (results === null) {
      print("no raycast result")
    } else {
      // get hit information
      const hitPosition = results.position;
      this.totalPositions = this.totalPositions.add(hitPosition);
      this.numHits += 1;
      print("raycast result #" + this.numHits);
    }
  }

  sendRaycastLoop() {
    if (this.scanning){
      // do raycast hit test
      this.primaryInteractor =
      SIK.InteractionManager.getTargetingInteractors().shift();
      const rayStartOffset = new vec3(
        this.primaryInteractor.startPoint.x,
        this.primaryInteractor.startPoint.y,
        this.primaryInteractor.startPoint.z + 30
      );
      const rayStart = rayStartOffset;
      const rayEnd = this.primaryInteractor.endPoint;

      this.hitTestSession.hitTest(
        rayStart,
        rayEnd,
        this.onHitTestResult.bind(this)
      );

      // schedule next raycast
      var evt = this.createEvent("DelayedCallbackEvent");
      evt.bind(this.sendRaycastLoop.bind(this));
      evt.reset(this.raycastTiming / 1000.0); // convert ms to seconds
    }
  }

  getScanPercentage() { 
    const avgPos = this.totalPositions.div(new vec3(this.numHits,this.numHits,this.numHits));
    const avgHorizPos = avgPos.mult(new vec3(1,1,0));
    const userHorizPos = this.cameraTransform.getWorldPosition().mult(new vec3(1,1,0));
    return avgHorizPos.distance(userHorizPos);
  }

  startScan() {
    print('scan started from scanner unit')
    // clear old data
    this.totalPositions = new vec3(0,0,0);
    this.numHits = 0;
    // start scanning
    this.scanning = true;
    this.sendRaycastLoop();
  }

  endScan() {
    // placeholder before rooms 
    this.scanning = false;
    const avgPos = this.totalPositions.div(new vec3(this.numHits,this.numHits,this.numHits));
    const avgHorizPos = avgPos.mult(new vec3(1,1,0));
    print("Scan result at position: " + avgHorizPos);
  }
}