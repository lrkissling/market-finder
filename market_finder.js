$(document).ready(function() {
  // modal dialog that shows details for a Farmer's Market
  $("#detail_dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 800,
    height: 300
  });

  // make USDA API call for market detail data
  $("#markets").on("click", ".details-link", function() {
    $("#detail_dialog").dialog("option", "title", this.name);
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + this.id,
        dataType: 'jsonp',
        jsonpCallback: 'marketDetailHandler'
    });
  });
});

// analyze user's keypresses on zipcode input to ensure proper zip codes
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

// call findNearbyMarkets and getForecast when zip code is entered, otherwise clear the page.
$("#zip_code").on("keyup", function() {
  val = this.value;
  if (val.length === 5 && isValidZip(val)) {
    findNearbyMarkets(val);
    getForecast(val);
  }
  else {
    $("#markets").empty();
    $("#forecast").empty();
  }
});

function isValidZip(val) {
  // if the val is 5 chars long and each char is a digit 0-9
  if (val.length === 5 && /^\d+$/.test(val)) {
    return true;
  }
  return false;
}

// query USDA API for markets within the given zip code.
function findNearbyMarkets(zip) {
  $.ajax({
      type: "GET",
      contentType: "application/json; charset=utf-8",
      url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
      dataType: 'jsonp',
      jsonpCallback: 'marketResultsHandler'
  });
}

// handle the data returned by the USDA API for nearby markets.
function marketResultsHandler(data) {
  $("#markets").empty();

  for (var i = 0; i < data.results.length; i++) {
    var id   = data.results[i].id,
        name = data.results[i].marketname;

    // remove distance from marketname
    name = name.substring(name.indexOf(" ") + 1);

    // inject HTML into markets list
    $("#markets").append(
      $("<li>").append(
        $("<span>").append(name),
        $("<button id ='" + id + "' name='" + name + "' class='details-link'>").append("Details")
    ));
  }
}

// handle the data returned by the USDA API for market details.
function marketDetailHandler(data) {
  $("#detail_dialog").empty();

  var addr = data.marketdetails.Address;
  var hours = data.marketdetails.Schedule;

  // inject HTML into market detail dialog
  $("#detail_dialog").append(
    $("<div>").append("Address: " + addr),
    $("<div>").append("Hours: " + hours)
  );
  $("#detail_dialog").dialog("open");
}

// get forecast from yahoo weather API for the given zip code
function getForecast(zip) {
  $.ajax({
      type: "GET",
      contentType: "application/json; charset=utf-8",
      url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D" + zip + ")&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
      dataType: 'jsonp',
      jsonpCallback: 'forecastResultHandler'
  });
}

// handle the data returned by the yahoo weather API
function forecastResultHandler(data) {
  $("#forecast").empty();
  if (data.query.results.channel.location.country == "United States") {
    var f = data.query.results.channel.item;

    // inject forecast info for next three days in appropriate div.
    $("#forecast").append($("<h3>").append("Forecast"));
    for (var i = 0; i < 3; i++) {
      $("#forecast").append(
        $("<div>").append(f.forecast[i].day + ":"),
        $("<ul>").append(
          $("<li>").append("High: " + f.forecast[i].high + " F"),
          $("<li>").append("Low: " + f.forecast[i].low + " F"),
          $("<li>").append("Description: " + f.forecast[i].text)
      ));
    }
  }
}
