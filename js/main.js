var flights;

window.onload = function loading() {
    document.getElementById("loading-wrapper").style.display = "none";
};

function initialize(clicked) {

    if(clicked === false) {
        getErrorMsg();
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        var position = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        console.log("latitude :" + position.lat);
        console.log("longitude :" + position.lng);
        document.getElementById("geolocation").style.display = "none";
        document.getElementById("content").style.display = "block";
        readFile("data.json", function(text) {
            flights = orderBy(JSON.parse(text).acList);
            allFlightsHtml(function(result) {
                document.getElementById('page-content').innerHTML = result;
            });
        });
    });
}

function getErrorMsg() {
    document.getElementById("geo-msg").innerHTML = "Application don't work without geolocation!";
}

function readFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    };
    rawFile.send(null);
}

function orderBy(list) {
    list.sort(function(a, b){

        if(a.GAlt === undefined) {
            a.GAlt = 0;
        }
        if(b.GAlt === undefined) {
            b.GAlt = 0;
        }

        if (a.GAlt < b.GAlt) {
            return 1;
        }
        if (a.GAlt > b.GAlt) {
            return -1;
        }

        return 0;  //no sorting
    });
    return list;
}

function allFlightsHtml(callback) {

    var html = getLabelsAllFlightsHtml();
    var geocoder = new google.maps.Geocoder();


    flights.forEach(function(item) {

        if(typeof callback === "function") {

            var address = item.From;
            geocoder.geocode({'address': address}, function (results, status) {

                if (status === google.maps.GeocoderStatus.OK) {
                    var longitude = results[0].geometry.location.lng();
                }

                item.direction = longitude > item.Long ? 'left' : 'right';
                html += getFlightHtml(item);

                callback(html);
            });
        } else {
            html += getFlightHtml(item);
        }

    });

    if(typeof callback !== "function") {
        document.getElementById('page-content').innerHTML = html;
    }
}

function getFlightHtml(flights) {
    return '<div class="line-view clearfix" onclick="singleView(' + flights.Id + ')">' +
        '<div class="icon-direction left w10p">' + '<i class="fa fa-long-arrow-' + flights.direction + '" aria-hidden="true"></i>' + '</div>' +
        '<div class="id-aircraft left w40p">' + '<span>' + flights.Id + '</span>' + '</div>' +
        '<div class="altitude left w40p">' + '<span>' + flights.Alt + '</span>' + '</div>' +
        '</div>';
}

function getLabelsAllFlightsHtml(){
    return '<div id="list-label" class="list-label clearfix">' +
        '<div class="icon-plane left w10p">' +
        '<i class="fa fa-plane fa-2x" aria-hidden="true"></i>' +
        '</div>' +
        '<div class="id-label left w40p">' +
        '<span>Id Aircraft</span>' +
        '</div>' +
        '<div class="altitude-label left w40p">' +
        '<span>Altitude in feets</span>' +
        '</div>' +
        '</div>';
}

function singleView(flightsId) {

    var singleFlight = flights.find(function (obj) {
        return obj.Id === flightsId
    });

    console.log(singleFlight.Alt);

    document.getElementById('page-content').innerHTML = '<div id="list-label" class="list-label clearfix">' +
        '<div class="icon-plane left w10p">' +
        '<i class="fa fa-plane fa-2x" aria-hidden="true"></i>' +
        '</div>' +
        '<div class="model-label left w25p">' +
        '<span>Manufacturer and model</span>' +
        '</div>' +
        '<div class="from-label left w25p">' +
        '<span>Origin airport</span>' +
        '</div>' +
        '<div class="to-label left w25p">' +
        '<span>Destination</span>' +
        '</div>' +
        '</div>' +
        '<div class="line-view clearfix">' +
        '<div class="icon-logo left w10p">' + '<img src="img/icons/' + singleFlight.Man + '.png">' + '</div>' +
        '<div class="model left w25p">' + '<span>' + singleFlight.Mdl + '</span>' + '</div>' +
        '<div class="from left w25p">' + '<span>' + singleFlight.From + '</span>' + '</div>' +
        '<div class="to left w25p">' + '<span>' + singleFlight.To + '</span>' + '</div>' +
        '</div>';
    document.getElementById('page-content').innerHTML += '<button class="line-view-btn clearfix" onclick="allFlightsHtml()">Back to All flights</button>';
}

