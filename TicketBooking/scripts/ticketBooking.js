/*
Created By: Vikram Deshmukh
Pre-requisites: jQuery, underscore, D3
*/
var TicketBooking = (function () {

  var _seatCount = 0, _category, _bookedSeats;
  var _seatingArrangement = [];

  
  // constructor
  function TicketBooking(seatingArrangement, count, category) {
  	if(!_seatingArrangement || !_.keys(seatingArrangement).length) {
  	  throw "Seating Arrangement is a required parameter of TicketBooking constructor";
  	  return;
  	}
  	this._seatingArrangement = seatingArrangement;

    if(category) this._category = category;
  	if(count) this._seatCount = count;
  };

  //  Method that draws the seating arrangement chart with blocked seats
  TicketBooking.prototype.renderChart = function () {

  	var scope = this, seatClass = this._seatingArrangement[this._category],
      w = Math.floor($("#container").width()/seatClass.c);

      /*  Was planning to use this to make individual seat dimensions relative. But did not find it necessary
      if(w < 20) w = 20;
      if(w > 40) w = 40;*/
      w=20;
      if($(document).width() > $(document).height()) 
        h = 0.7 * w;
      else 
        h = 1.2 * w;

    var booked = scope._bookedSeats[scope._category];
    
    d3.select("#container").selectAll("seatClass").data(_.keys(this._seatingArrangement))   //  Adding sections
      .enter() 
        .append("div")
          .attr("class", function(e,k){ 
            d3.select(this).append("h2").html(e);
            d3.select(this).selectAll("div").data(new Array(seatClass.r)) //  Adding rows
              .enter()
                .append("div")
                  .style("display", function(d,i){ 
                    d3.select(this).selectAll("div").data(new Array(seatClass.c)) //  Adding seats in individual rows
                      .enter()
                        .append("div")
                          .style("width", w+"px")
                          .style("height", h+"px")
                          .style("background", /*colors[e]*/ "whitesmoke")
                          .style("border", "1px solid #ccc")
                          .attr("class", function(o,j){
                            return "seat seat"+i+"x"+j;
                          })
                          .attr("title", function(o,j){ 
                            if(e == scope._category) {
                              if(booked.indexOf(i+"x"+j) != -1) 
                                return "Booked Already!";
                              return i+"x"+j;   
                            }
                            return "";
                          })
                          .style("display", "inline-block")
                          .style("cursor", function(f,l) {
                            
                            if(e != scope._category) {  //  check if current category
                              d3.select(this).style("opacity", 0.5);
                              return "default";
                            }
                            if(booked.indexOf(i+"x"+l) != -1) { //  check if already booked
                              d3.select(this).style("background", "grey");
                              d3.select(this).classed("booked", true)
                              return "default";
                            }
                            d3.select(this).on("click", function(e){ selectSeats(this, scope._seatCount, booked, scope._seatingArrangement[category]);})
                            return "pointer";
                            
                          })
                    return "block";
                  })
                  
            return "seatClass "+scope._category;
          })
          .style("position", "relative")
          .style("margin-bottom", "10px")
    
    d3.select("footer").append("button").html("Back").attr("class", "myButton").on("click", function(){
      //  Quick hack to call a function on the HTML page to reset and go back to the previous screen
      window.showSeatInfoForm();
    });

    d3.select("footer").append("span").attr("class", "myPrimaryButton").html("Make Payment").on("click", function(){
      
      var selectedSeats = _.map(d3.selectAll(".seat.selected")[0], function(d,i){
        //  clean up the string of class applied to the button to get the seat number  
        return d3.select(d).attr("class").replace(/seat/g, "").replace("selected", "").replace(/ /g, "");;
      });
      //console.log(selectedSeats, scope._category);
      alert("You've booked "+selectedSeats.length+" tickets in "+scope._category+"\n Your seat numbers are: "+selectedSeats.join(", "))
    });

    //  Adjust height of the container to ensure the browser window does not show up it's own vertical scroll
    d3.select("#container").style("height", ($(window).height() - $("header h1").outerHeight(true) - $("footer").outerHeight(true) - 20)+"px");
  };


  /*
    This is where the seat selection logic checks if the user's selection is valid
  */
  var selectSeats = function(d, count, currentSectionBooked, currentSectionCapacity){
    
    var seat = d3.select(d).attr("class").replace("selected", "").split("seat").join("").split(" ").join("");
    var category = d3.select(d3.select(d).node().parentNode.parentNode).attr("class").replace("seatClass", "").replace(" ", "")  
    
    var currentRow = parseInt(seat.split("x")[0]);

    var currentRowSeats = _.range(currentSectionCapacity.c);
    _.each(currentRowSeats, function(d,i) {
      currentRowSeats[i] = currentRow+"x"+d;
    })
    var seatsToBook = [seat];
    var i = j =  parseInt(seat.split("x")[1]);
    i++;
    j--;
    do {
      //  keep going left until you find the end or a booked seat
      if(currentSectionBooked.indexOf(currentRow+"x"+j) == -1 && j > 0 && j != -1){ 
        seatsToBook.push(currentRow+"x"+j);
        j--;
      }else {
        j = -1; //  to indicate no chance of finding an adjacent, vacant seat on left
      }
      //  keep going right until you find the end or a booked seat
      if(seatsToBook.length < count && currentSectionBooked.indexOf(currentRow+"x"+i) == -1 && i < currentRowSeats.length && i != -1){
        seatsToBook.push(currentRow+"x"+i);
        i++;
      }else {
        i = -1; //  to indicate no chance of finding an adjacent, vacant seat on right
      }
    }while(seatsToBook.length < count && (i != -1 || j != -1));

    
    if(seatsToBook.length < count) {
      alert("Sorry but we cannot allocate the desired seats. Please select some other seats.");
      return
    }

    //  highlight selected buttons
    d3.selectAll(".seat").style("background", "whitesmoke")
    d3.selectAll(".seat.booked").style("background", "grey")
    d3.selectAll(".seat.selected").classed("selected", false);
    _.each(seatsToBook, function(o,i){
      d3.select(d3.select(d).node().parentNode).select(".seat"+o).style('background', "lightgreen").classed("selected", true)
    })
    
  };



  TicketBooking.prototype.setBookedSeats = function (booked) {
    this._bookedSeats = booked;
  };

  TicketBooking.prototype.getBookedSeats = function () {
    return this._bookedSeats;
  };

  return TicketBooking;
})();