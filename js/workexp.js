$(document).ready(function(){
  d3.select("body").append("h1").html("Vikram Deshmukh &middot; Career information");
  $.ajax({
  	url: "/docs/workexperience.json",
  	type: "GET",
  	error: function(){ console.log("Error loading information!!")}
  }).done(function(data){
  	console.log(data);
  });
});