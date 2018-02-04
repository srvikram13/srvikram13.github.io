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
				checkJobStatus(data.id);
				job = data;
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
let pollingId;
let job;
function checkJobStatus(jobId) {
	clearInterval(pollingId);
	//	https://{{BASE_API_URL}}/{{STAGE}}/{{APP_NAME}}?action=checkJobStatus&id=6eaf351a-7462-402e-81a9-92efe0a197c2
	pollingId = setInterval(function (){
		fetch(`https://${BASE_API_URL}/${STAGE}/${APP_NAME}?action=checkJobStatus&id=${job.id}`)
		.then((resp) => resp.json())
		.then((data) => {
			//console.log('checkJob response', data)
			if(data && data.id) {
				job = data;
				switch(job.state){
					case JOB_CREATED:
						return;
					case JOB_IN_PROGRESS:
						$("#btn-cancel").hide();
						showMessage("Pickup Assigned", "The Collector will be at your location shortly.");
						break;
					case JOB_DONE:
						showMessage("Pickup Complete", "The Collector has completed the pickup.", "positive");
						setTimeout(window.location.reload.bind(window.location), 3000);
						break;
					case JOB_CANCELLED:
						location.reload();
						return;
				}
				//checkJobStatus(data.id);
			}

		})
		.catch(err=>console.log(err));
	}, 10000);
	
}