 function GeoLocate(onSuccess, onError) {
    if (!navigator.geolocation) {
        onError("Geolocation not supported in this browser");
        return;
    }

    try {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var coords = position.coords || position.coordinate || position;
                onSuccess(coords);
            },
            function (error) {
                var msg;
                console.log(error.code);
                switch (error.code) {
                    case error.UNKNOWN_ERROR: msg = "Unable to find your location"; break;
                    case error.PERMISSION_DENINED: msg = "Permission denied in finding your location"; break;
                    case error.POSITION_UNAVAILABLE: msg = "Your location is currently unknown"; break;
                    case error.TIMEOUT: msg = "Attempt to find location took too long"; break;
                    case error.BREAK: msg = "Attempt to find location took too long 2"; break;
                    default: msg = "Other error: " + error.code;
                }

                var errorObj = new Object();
                errorObj.error = error;
                errorObj.message = msg;
                onError(errorObj);
            },
            { timeout: 10000, enableHighAccuracy: true });
    }
    catch (ex) {
        console.log(error);
        onError("Exception: " + ex);
    }
}

var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        var self = this;
		app.log('Initialize');
        self.showAlert("Initialize","Info");
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		try {
			app.log("Initialized");
			app.showAlert("Initialized","Info");
			app.receivedEvent('deviceready');

			GeoLocate(
				function(coords){
					app.log('Got coordinates ' + coords.latitude + ', ' + coords.longitude);
					$('#lat').html(coords.latitude);
					$('#long').html(coords.longitude);
				}, 
				function(error){
					app.log('Error getting location: '+ error);
				});
			app.log("Geolocate called");

					
			$('#locate').click(function() {
				app.log('Clicked');
			});
		}
		catch(ex){
			app.log(ex);
		}
    },
	
	log: function (message)
	{
		console.log(message);
		$('#update').prepend('<tr><td>'+ new Date().toString()+ 'td><td>'+message+'</td></tr>');
	},
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        app.log('Received Event: ' + id);
    },
    
    showAlert: function (message, title) {
		if (navigator.notification) {
			navigator.notification.alert(message, null, title, 'OK');
		} else {
			alert(title ? (title + ": " + message) : message);
		}
	},
};
