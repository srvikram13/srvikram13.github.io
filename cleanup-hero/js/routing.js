setInterval(function(){
    navigator.geolocation.getCurrentPosition(showPosition);
},10000);
const maxCapacity = 50;
let currentCapacity = maxCapacity;
let radius = 3;
let jobs = [];
let myCoord;
function showPosition(position){
    myCoord = {"lat": position.coords.latitude, "lon":position.coords.longitude};
    var payload = {
        "currentLocation": {
            "latitude": position.coords.latitude, 
            "longitude": position.coords.longitude
            },
        "currentCapacity": currentCapacity,
        "maxRadius": radius,
        "maxCapacity": maxCapacity,
        "action":"getJob",
        "jobLocations": jobs.map((job)=> job.jobLocation)
    }

    fetch(`https://${BASE_API_URL}/${STAGE}/${APP_NAME}`, {
            method: 'POST',
            body: JSON.stringify(payload),
            mode: "cors"
        })
        .then((resp) => resp.json())
        .then((data) => {
            console.log('getJob response', data)
            if(data && data.job) {
                const job = data.job;
                jobs.push(job);
                currentCapacity -= job.quantity;
                updateJobs();

                updateRoute();
            }

        })
        .catch(err=>console.log(err));

}
function updateRoute() {
    // Adding route-on-map widget
    var routeOnMapView = tomtom.routeOnMap().addTo(map);
    let points = jobs.map(job => { return {"lat":job.jobLocation.latitude, "lon":job.jobLocation.longitude}});
    points = [myCoord].concat(points);
    //console.log("updating route", JSON.stringify(points));
    routeOnMapView.draw(points);
    

}
// Define your product name and version
tomtom.setProductInfo('MapsWebSDKExamples', '4.20.2-SNAPSHOT');
tomtom.routingKey(API_KEY);
tomtom.searchKey(API_KEY);

var map = tomtom.map('map', {
    key: API_KEY,
    source: 'vector',
    basePath: 'https://api.tomtom.com/maps-sdk-js/4.19.5/examples/sdk'
});

var languageLabel = L.DomUtil.create('label');
languageLabel.innerHTML = 'Maps language';
var languageSelector = tomtom.languageSelector.getHtmlElement(tomtom.globalLocaleService, 'maps');
languageLabel.appendChild(languageSelector);
tomtom.controlPanel({
    position: 'bottomright',
    title: 'Settings',
    collapsed: true,
    closeOnMapClick: false
})
    .addTo(map)
    .addContent(languageLabel);

function updateJobs(){
    return;
    jobs.forEach(job => {
        $("section").append()
    });
    
}