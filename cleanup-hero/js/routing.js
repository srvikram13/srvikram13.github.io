/////////////////////////////////////////////////////////////////////////////////////////////////////////
// =========================================================================================
//
// TomTom namespace
//
// =========================================================================================
var KACHARA_ENV = {
  BASE_API_URL: "kkbjr8xfbj.execute-api.us-west-2.amazonaws.com",
  STAGE: "prod",
  APP_NAME: "test-api-gateway"
};
// =========================================================================================
/**
 * @class ServiceProvider
 */
var ServiceProvider = /** @class */ (function() {
  //
  ////////////////////////////////////////////////////////
  /**
   * Creates a new ServiceProvider
   * @param {number} maxRadius The maximum search radius for jobs.
   * @param {number} maxCapacity The maximum capacity of the collector.
   * @memberof ServiceProvider
   */
  function ServiceProvider(maxRadius, maxCapacity) {
    this.jobs = [];
    this.maxRadius = maxRadius;
    this.maxCapacity = maxCapacity;
    this.currentCapacity = maxCapacity;
  }

  /**
   * Sets the current location of the provider.
   * @param {Position} position The position of the provider.
   * @memberof ServiceProvider
   */
  ServiceProvider.prototype.setLocation = function(position) {
    var _this = this;
    this.currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    //
    //
    //
    setInterval(function() {
      return _this.pollJobs();
    }, 1000);
  };
  ////////////////////////////////////////////////////////////////////////////////////
  /**
   * Adds the job to the provider's job queue.
   * @param {IJob} newJob The new incoming job.
   * @memberof ServiceProvider
   */
  ServiceProvider.prototype.addJob = function(newJob) {
    this.jobs.push(newJob);
    this.currentCapacity = this.currentCapacity - newJob.quantity;
  };
  /**
   * Restores the current capacity of the provider.
   * @memberof ServiceProvider
   */
  ServiceProvider.prototype.restoreCapacity = function() {
    this.currentCapacity = this.maxCapacity;
  };
  /**
   * Fetches the list of all the current job locations.
   * @returns {Array<{
   *     latitude: number;
   *     longitude: number;
   *   }>}
   * @memberof ServiceProvider
   */
  ServiceProvider.prototype.getJobLocations = function() {
    if (this.jobs.length === 0) return [];
    return this.jobs.map(function(job) {
      return job.jobLocation;
    });
  };
  /**
   * Generates the waypoints string delimited by (:)
   * @private
   * @returns {string} the (:) delimited waypoints.
   * @memberof ServiceProvider
   */
  ServiceProvider.prototype.getWayPoints = function() {
    return [this.currentLocation]
      .concat(this.getJobLocations())
      .map(function(p) {
        return p.latitude + "," + p.longitude;
      })
      .join(":");
  };
  /**
   * Polls the backend for new jobs recursively.
   * @private
   * @memberof ServiceProvider
   */
  ServiceProvider.prototype.pollJobs = function() {
    var _this = this;
    //
    //
    var currentLocation = this.currentLocation;
    var currentCapacity = this.currentCapacity;
    var maxRadius = this.maxRadius;
    var jobLocations = this.getJobLocations();
    var maxCapacity = this.maxCapacity;
    //
    //
    if (!this.currentLocation) return;
    fetch(
      "https://" +
        KACHARA_ENV.BASE_API_URL +
        "/" +
        KACHARA_ENV.STAGE +
        "/" +
        KACHARA_ENV.APP_NAME,
      {
        method: "POST",
        body: JSON.stringify({
          currentLocation,
          currentCapacity,
          maxRadius,
          maxCapacity,
          action: "getJob",
          jobLocations
        }),
        mode: "cors"
      }
    )
      .then(function(response) {
        return response.json();
      })
      .then(function(kachraResponse) {
        console.log(`waypoints = ${_this.getWayPoints()}`);
        //
        //
        if (kachraResponse.job) {
          _this.addJob(kachraResponse.job);
          //
          //
          if (_this.drawMap)
            _this
              .drawMap(_this.getWayPoints())
              .then(function() {
                console.log("Done!");
              })
              .catch(function(msg) {
                return console.log(msg);
              });
          //
          //
        }
        //
        //
        //
      })
      .catch(function(err) {
        return console.log(err);
      });
    //
    //
  };
  return ServiceProvider;
})();
// =========================================================================================
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//
// The collector - defaults to maxRadius = 10 miles and maxCap = 33 units.
//
let collector = new ServiceProvider(10, 33);

//
// Get current location from the browser
//
// window.navigator.geolocation.getCurrentPosition(
//   collector.setLocation.bind(collector),
//   err => console.log(`Error = ${err.message}`)
// );

//
// In case you need a watcher
//
window.navigator.geolocation.watchPosition(collector.setLocation.bind(collector), err =>
  console.log(`Error = ${err.message}`)
);

//
// Configuration that seems to be working fine.
//
const map = tomtom.map("map", {
  key: "hARrS9d56xdEza8g35qvZF6EuWBnG6Zw",
  source: "vector",
  style: "main",
  layer: "basic",
  basePath: "/cleanup-hero/sdk",
  noRefresh: false,
  refresh: 1,
  glyphsUrl: "/cleanup-hero/sdk/glyphs/FrutigerHelveticaMYingHei-Medium/0-1023.pbf"
});

var routeOnMapView = new tomtom.L.RouteOnMap(); // the plugin to draw the routes on the map

window.navigator.geolocation.getCurrentPosition(
  pos => {
    let ps = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    routeOnMapView.addTo(map);
    routeOnMapView.clear(); // clear the layers before drawing
    routeOnMapView.draw([ps, ps]); // plot the point on map
  },
  err => console.log(`Error = ${err.message}`)
);

//
// The drawMap method definition
//
collector.drawMap = function(waypoints) {
  return new Promise((resolve, reject) => {
    if (!waypoints) reject("No waypoints to draw!");
    routeOnMapView.addTo(map);
    routeOnMapView.clear(); // clear the layers before drawing
    routeOnMapView.draw(getPoints(waypoints)); // draw the map and route
  });
};

//
// Event triggered when the route is drawn successfully
//
routeOnMapView.on(tomtom.L.RouteOnMap.Events.Draw, function(eventObject) {
  routeOnMapView.fitMapBoundsToRoute(); // fit the map to the bounds
  console.log("event triggered = \\||/ \n" + eventObject);
});

//
// To get points for matrix routing request.
//
function getPoints(waypoints) {
  var points = [];
  waypoints.split(":").forEach(s => {
    var ps = s.split(",");
    points.push({
      lat: parseFloat(ps[0]),
      lon: parseFloat(ps[1])
    });
  });
  return points;
}
