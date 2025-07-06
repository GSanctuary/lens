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
  private positionArr: vec3[];
  private numHits = 0; 
  private scanning = false;
  private raycastTiming = 250; // ms
  private hitTestSession;
  // TODO: FIX BROKEN RAYCASTING 
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
      this.positionArr.push(hitPosition);
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
    const avgScanPos = this.totalPositions.div(new vec3(this.numHits,this.numHits,this.numHits)).mult(new vec3(1,0,1));
    const userHorizPos = this.cameraTransform.getWorldPosition().mult(new vec3(1,0,1));
    return avgScanPos.distance(userHorizPos);
  }

  startScan() {
    print('scan started from scanner unit')
    // clear old data
    this.totalPositions = new vec3(0,0,0);
    this.positionArr = [];
    this.numHits = 0;
    // start scanning
    this.scanning = true;
    this.sendRaycastLoop();
  }

  endScan() {
    // placeholder before rooms 
    this.scanning = false;
    //const avgPos = this.totalPositions.div(new vec3(this.numHits,this.numHits,this.numHits)).mult(new vec3(1,1,0));
    //print("Scan result at position: " + avgPos);
  }

  getFinalScanData() : [vec3, number, number, number] {
    // Calculate center point (average of all points)
    let sumX = 0, sumY = 0, sumZ = 0;
    for (let i = 0; i < this.positionArr.length; i++) {
        sumX += this.positionArr[i].x;
        sumY += this.positionArr[i].y;
        sumZ += this.positionArr[i].z;
    }
    
    const center = new vec3(
        sumX / this.positionArr.length,
        sumY / this.positionArr.length,
        sumZ / this.positionArr.length
    );
    
    // Find minimum oriented bounding box
    let bestYaw = 0;
    let bestHalfScaleX = 0;
    let bestHalfScaleZ = 0;
    let minArea = Infinity;
    
    // Test different orientations to find the one that gives the smallest bounding box
    for (let angleDeg = 0; angleDeg < 90; angleDeg += 2) { // Test every 2 degrees
        const angleRad = angleDeg * Math.PI / 180;
        const cosAngle = Math.cos(angleRad);
        const sinAngle = Math.sin(angleRad);
        
        // Rotate all points to this orientation and find their axis-aligned bounds
        let minRotX = Infinity, maxRotX = -Infinity;
        let minRotZ = Infinity, maxRotZ = -Infinity;
        
        for (let i = 0; i < this.positionArr.length; i++) {
            const point = this.positionArr[i];
            // Translate to center-relative coordinates
            const dx = point.x - center.x;
            const dz = point.z - center.z;
            
            // Rotate point
            const rotX = dx * cosAngle - dz * sinAngle;
            const rotZ = dx * sinAngle + dz * cosAngle;
            
            minRotX = Math.min(minRotX, rotX);
            maxRotX = Math.max(maxRotX, rotX);
            minRotZ = Math.min(minRotZ, rotZ);
            maxRotZ = Math.max(maxRotZ, rotZ);
        }
        
        const halfScaleX = (maxRotX - minRotX) / 2;
        const halfScaleZ = (maxRotZ - minRotZ) / 2;
        const area = halfScaleX * halfScaleZ;
        
        // Keep the orientation that gives the smallest area
        if (area < minArea) {
            minArea = area;
            bestYaw = angleDeg;
            bestHalfScaleX = halfScaleX;
            bestHalfScaleZ = halfScaleZ;
        }
    }
    
    // Ensure minimum scale to avoid degenerate cases
    const minScale = 0.1;
    bestHalfScaleX = Math.max(bestHalfScaleX, minScale);
    bestHalfScaleZ = Math.max(bestHalfScaleZ, minScale);
    
    return [center, bestHalfScaleX, bestHalfScaleZ, -bestYaw];
  }
}