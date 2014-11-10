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
        app.log(error);
        onError("Exception: " + ex);
    }
}

function DisplayCoords(coords){
	$('#lat').html(coords.latitude);
	$('#long').html(coords.longitude);
	$('#error').html(coords.accuracy);
}

var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();
		app.log('Initialize');
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
			app.receivedEvent('deviceready');

			if (window.plugins.backgroundGeoLocation) {
				app.configureBackgroundGeoLocation();
			}
			
			// call the first geolocation
			GeoLocate(
				function(coords){
					app.log('Got coordinates ' + coords.latitude + ', ' + coords.longitude);
					DisplayCoords(coords);
				}, 
				function(error){
					app.log('Error getting location: '+ error);
				});
				
			app.log("Geolocate called");
				
		}
		catch(ex){
			app.log(ex);
		}
    },
	
	log: function (message)
	{	
		try{
			console.log(message);
			$('#update').prepend('<tr><td>'+ new Date().toString()+ 'td><td>'+message+'</td></tr>');
		}
		catch(ex)
		{
			console.log("Error logging error: "+ex);
		}
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
	configureBackgroundGeoLocation: function() {
        // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
        //  in order to prompt the user for Location permission.
        window.navigator.geolocation.getCurrentPosition(function(location) {
            console.log('Location from Phonegap');
        });

        var bgGeo = window.plugins.backgroundGeoLocation;

        /**
        * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
        */
        var yourAjaxCallback = function(response) {
            ////
            // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
            //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            //
            //
            bgGeo.finish();
        };

        /**
        * This callback will be executed every time a geolocation is recorded in the background.
        */
        var callbackFn = function(location) {
            console.log('[js] BackgroundGeoLocation callback:  ' + location.latitudue + ',' + location.longitude);
            // Do your HTTP request here to POST location to your server.
            //
            //
            yourAjaxCallback.call(this);
        };

        var failureFn = function(error) {
            console.log('BackgroundGeoLocation error');
        }
        
        // BackgroundGeoLocation is highly configurable.
        bgGeo.configure(callbackFn, failureFn, {
            url: 'http://only.for.android.com/update_location.json', // <-- only required for Android; ios allows javascript callbacks for your http
            params: {                                               // HTTP POST params sent to your server when persisting locations.
                auth_token: 'user_secret_auth_token',
                foo: 'bar'
            },
            headers: {
                'X-Foo': 'bar'
            },
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            notificationTitle: 'Background tracking',   // <-- android only, customize the title of the notification
            notificationText: 'ENABLED',                // <-- android only, customize the text of the notification
            activityType: "AutomotiveNavigation",       // <-- iOS-only
            debug: true     // <-- enable this hear sounds for background-geolocation life-cycle.
        });
		app.log('Background tracking configured');

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        //bgGeo.start();

        // If you wish to turn OFF background-tracking, call the #stop method.
        // bgGeo.stop()
    },
	function StartGeolocation()
	{
		// Turn ON the background-geolocation system.  
		// The user will be tracked whenever they suspend the app.
        var bgGeo = window.plugins.backgroundGeoLocation;
		bgGeo.start();
		app.log('Background tracking started');
	},
	// If you wish to turn OFF background-tracking, call the #stop method.
	function StopGeolocation()
	{
        var bgGeo = window.plugins.backgroundGeoLocation;
		bgGeo.stop()
		app.log('Background tracking stopped');
	}
};
