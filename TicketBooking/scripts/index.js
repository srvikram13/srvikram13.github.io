var seats = [];
seats["gold"] = {r:7,c:8};
seats["silver"] = {r:10,c:8};
seats["bronze"] = {r:13,c:8};

var bookedSeats = [];
bookedSeats["gold"] = ["1x1", "1x2","1x3", "2x0"];
bookedSeats["silver"] = ["1x1", "1x2","1x3","2x1", "1x2","1x3"];
bookedSeats["bronze"] = ["1x1", "1x2","1x3"];


var maxSeats = 8;	//	max number of seats allowed for booking during one session

var category = '';  //   GOLD, SILVER, BRONZE
var nSeats = 0;     //   seats the user wishes to book during this session

var bookingmgr;     //   instance of Ticket Booking class

$(document).ready(function () { 
  	showSeatInfoForm();	
});

//   resets the container to display Seat information form
function showSeatInfoForm() {
   var container = d3.select("#container").html('');
   d3.select("footer").html('');
   container.transition().duration(250).ease("cubic").style("opacity", 0).each("end", function(){
     container.html('');
     createSelect(container, ["--"].concat(_.keys(seats)), "classSelect", "Select Ticket Class");
     createSelect(container, _.range(maxSeats+1), "seatCount", "Select");

     container.append("button").attr("id", "proceedbtn").attr("class", "myPrimaryButton").html("Select Seats").on("click", function(){
       if(!$("#classSelect")[0].selectedIndex) {
	    alert("Please select the seat category before proceeding further.");
	    return;
       }
       if(!$("#seatCount")[0].selectedIndex) {
 	    alert("Please select the number of seats before proceeding further.");
	    return;
       }
       category = $('#classSelect>option:selected').text();
       nSeats = $('#seatCount>option:selected').text();

       showSeatingChart();
     })
     d3.select(this).transition().duration(250).ease("cubic").style("opacity", 1);
   });
}

//   Calls Ticket Booking class to render the chart
function showSeatingChart(){
  var container = d3.select("#container").html('');
  var scope = this;
  container.transition().duration(250).ease("cubic").style("opacity", 0).each("end", function(){
  	container.html('');
     bookingmgr = null;
	bookingmgr = new TicketBooking(scope.seats, scope.nSeats, scope.category);
     bookingmgr.setBookedSeats(bookedSeats)
	bookingmgr.renderChart();
	d3.select(this).transition().duration(250).ease("cubic").style("opacity", 1);
  })
}

//   A single parametric function used to create select-option HTML control
function createSelect(container, keys, id, instructionLabel) {
   container.append("label").html(instructionLabel).attr("for", id);
   container.append("select")
     .attr("id", id);
   d3.select("#"+id).selectAll("option").data(keys)
     .enter()
       .append("option")
         .attr("value", function(d,i){ return d;})
         .html(function(d){ return d});
}