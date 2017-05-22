$(document).ready(function() {
  $("#detail_dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 800,
    height: 300
  });
  $("#markets").on("click", ".details-link", function() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + this.id,
        dataType: 'jsonp',
        jsonpCallback: 'marketDetailHandler'
    });
  });
});

$("#zip_code").on("keydown", function(e) {
  // return true if the key press is numerical
  if (e.which >= 48 && e.which <= 57) {
    return true;
  }

  // return true if the key press is a delete or backspace
  if (e.which === 8 || e.which === 46) {
    return true;
  }
  return false;
});

$("#zip_code").on("keyup", function() {
  val = this.value;
  if (val.length === 5 && isValidZip(val)) {
    findNearbyMarkets(val);
  }
  else {
    $("#markets").empty();
  }
});

function isValidZip(val) {
  // if the val is 5 chars long and each char is a digit 0-9
  if (val.length === 5 && /^\d+$/.test(val)) {
    return true;
  }
  return false;
}

function findNearbyMarkets(zip) {
  $.ajax({
      type: "GET",
      contentType: "application/json; charset=utf-8",
      url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
      dataType: 'jsonp',
      jsonpCallback: 'marketResultsHandler'
  });
}

function marketResultsHandler(data) {
  $("#markets").empty();

  for (var i = 0; i < data.results.length; i++) {
    var id   = data.results[i].id,
        name = data.results[i].marketname;

    // remove distance from marketname
    name = name.substring(name.indexOf(" ") + 1);

    $("#markets").append(
      $("<li>").append(
        $("<span>").append(name)
      ).append(
        $("<button id ='" + id + "' class='details-link'>").append("Details")
    ));
  }
}

function marketDetailHandler(data) {
  $("#detail_dialog").empty();

  var addr = data.marketdetails.Address;
  var hours = data.marketdetails.Schedule;
  $("#detail_dialog").append(
    $("<div>").append("Address: " + addr),
    $("<div>").append("Hours: " + hours)
  );
  $("#detail_dialog").dialog("open");
}
