/*document.getElementById("fname").addEventListener("keyup", myFunction);

function myFunction() {
    var x = document.getElementById("fname");
    x.value = x.value.toUpperCase();
}

fetch("https://api.tomtom.com/search/2/search/pizza.json?key=hARrS9d56xdEza8g35qvZF6EuWBnG6Zw&typeahead=true&countrySet=US")
	.then((resp) => resp.json())
	.then((data) => console.log('data', data))
		.catch(err=>console.log(err));
*/
const BASE_URL = 'api.tomtom.com';
const VERSION_NUMBER = '2';
const API_KEY = 'hARrS9d56xdEza8g35qvZF6EuWBnG6Zw';

const BASE_API_URL = 'kkbjr8xfbj.execute-api.us-west-2.amazonaws.com';
const STAGE = 'prod';
const APP_NAME = 'test-api-gateway';

const JOB_CREATED = 0;
const JOB_IN_PROGRESS = 1;
const DONE = 2;
const CANCELLED = 3;

$('.ui.search')
  .search({
    apiSettings: {
    	url: `https://${BASE_URL}/search/${VERSION_NUMBER}/search/{query}.json?key=${API_KEY}&typeahead=true&countrySet=US`,
    	onResponse: function(results) {    
    	    var response = {
    	        results : []
    	    };  
    	    $.each(results.results, function(index, item) {
    	        response.results.push({
    	            title       : item.type === "POI" ? item.poi.name : item.address.streetName,
    	            description : item.address.freeformAddress.substr(0,25),
    	            latitude 	: item.position.lat,
    	            longitude 	: item.position.lon
    	        });
    	    });    
    	    return response;
    	}
    },
    minCharacters : 3,
	onSelect: function(result, response) {
		$(this).attr('data-latitude', result.latitude).attr('data-longitude', result.longitude);
		$(this).find("input").val(result.title);
		$(this).find(".results").removeClass("visible").css("display", "");
		//return false;
	}
  });

$("form").submit(function(e){
	showMessage("Sit tight!", "We're looking for a collector for the job.");
	const payload = {
		"currentLocation":{
			"latitude": $(".ui.search").data('latitude'),
			"longitude":$(".ui.search").data('longitude')
		},
		"quantity": parseInt($("#quantity-disp").val()),
		"action": "bookJob"
	}

	fetch(`https://${BASE_API_URL}/${STAGE}/${APP_NAME}`, {
	    	method: 'POST',
	    	body: JSON.stringify(payload),
	    	mode: "cors"
	  	})
		.then((resp) => resp.json())
		.then((data) => {
			console.log('bookJob response', data)
			if(data && data.id) {
				showMessage("Pickup Requested", "Looking for nearby collector", "positive")
			}

		})
		.catch(err=>console.log(err));

	return false;
})
function showMessage(heading, desc, state) {
	$(".ui.buttons").hide();
	$(".ui.message").show().attr("class", "ui icon message");
	if(state) {
		$(".ui.message").addClass(state);
	}
	if(heading) $(".ui.message").find('.header').html(heading);
	if(desc) $(".ui.message").find('p').html(desc);
}
function hideMessage(){
	$(".ui.buttons").show();
	$(".ui.message").hide();
}
