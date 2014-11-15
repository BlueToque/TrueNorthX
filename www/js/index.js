//
// Get the location
//
function GeoLocate(onSuccess, onError, options) {
    if (!navigator.geolocation) {
        onError("Geolocation not supported in this browser");
        return;
    }

    try {
        if (options == null)
            options = { timeout: 10000, enableHighAccuracy: true };

        navigator.geolocation.getCurrentPosition(
            function (position) {
                var coords = position.coords || position.coordinate || position;
                onSuccess(coords);
            },
            function (error) {
                PositionError(error, onError)
            },
            options);
    }
    catch (ex) {
        app.log(error);
        onError("Exception: " + ex);
    }
}

//
// Generic position error method
//
function PositionError(error, onError)
{
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
}

//
// Start tracking location
//
function TrackLocation(onSuccess, onError, options) {
    if (!navigator.geolocation) {
        onError("Geolocation not supported in this browser");
        return;
    }

    try {
        if (options == null)
            options = { timeout: 10000, enableHighAccuracy: true };

        var watchID =
            navigator.geolocation.watchPosition(
                function (position) {
                    var coords = position.coords || position.coordinate || position;
                    onSuccess(coords);
                },
                function (error) {
                    PositionError(error, onError)
                },
                options);
    }
    catch (ex) {
        onError("Exception: " + ex);
    }
}

function DisplayCoords(coords) {
    app.log("Coordinates " + coords);
	$('#lat').html(coords.latitude);
	$('#long').html(coords.longitude);
	$('#error').html(coords.accuracy);
}

function refreshAuthDisplay() {
    var isLoggedIn = client.currentUser !== null;
    $("#logged-in").toggle(isLoggedIn);
    $("#logged-out").toggle(!isLoggedIn);

    if (isLoggedIn) {
        $("#login-name").text(client.currentUser.userId);
        refreshTodoItems();
    }
}

var app = {
    watchID: null,
    client: undefined,

    // Application Constructor
    initialize: function () {
        this.bindEvents();
        client = new WindowsAzure.MobileServiceClient(
            "https://truenorthtracker.azure-mobile.net/",
            "ngCCuUVAhXipnmqGCUeqJWdJciiKck31"
            );
        app.log('Initialized');
    },

    // Bind Event Listeners
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        app.log("Binding events");
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        app.log("Events bound");
    },

    onResume: function () {
        app.log("Event:resume");
        window.plugin.backgroundMode.disable();
    },
    onPause: function () {
        app.log("Event:pause");
        window.plugin.backgroundMode.enable();
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        try {
            app.log("Initialized");
            app.receivedEvent('deviceready');
            refreshAuthDisplay();

        }
        catch (ex) {
            app.log(ex);
        }
    },
    log: function (message) {
        try {
            console.log(message);
            $('#update').prepend('<tr><td width="300px">' + new Date().toISOString() + '</td><td>' + message + '</td></tr>');
        }
        catch (ex) {
            console.log("Error logging error: " + ex);
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        app.log('Received Event: ' + id);
    },

    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },
    StartGeolocation: function () {
        try {

            if (this.watchID != null) {
                this.log("Background tracking already active");
                return;
            }

            this.log("Starting Background tracking");

            var options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0, desiredAccuracy: 0, frequency: 1 };

            this.watchID = TrackLocation(
                function (position) { DisplayCoords(position); },
                function (error) { app.log(error.message) },
                options);

            this.log('Background tracking started');
        }
        catch (ex) {
            this.log("Error starting background geolocation: " + ex);
        }
    },

    StopGeolocation: function () {
        try {
            if (this.watchID != null) {
                this.log("Stopping Background tracking");
                navigator.geolocation.clearWatch(app.watchID);
                this.watchID = null;
                this.log('Background tracking stopped');
            }
            else { this.log('Background tracking not active'); }
        }
        catch (ex) {
            this.log("Error stopping background geolocation: " + ex);
        }
    },

    AddItem: function (coords) {
        app.log("adding item to table");
        try {
            trackingTable = client.getTable('Tracking');
            todoItemTable.insert({
                lat: coords.latitude,
                lon: coords.longitude,
                alt: coords.altitude,
                heading: coords.heading,
                speed: coords.speed,
                error: coords.accuracy
            });
            app.log("added item to table");
        }
        catch (ex) {
            app.log("Error adding item to table: " + ex);
        }
    },

    Login: function () {
        app.log("Logging in");
        client.login("google")
            .then(
                refreshAuthDisplay,
                function (error) {
                    app.log("Error logging in: " + error);
                    //alert(error);
                });
    },
    Logout: function () {
        app.log("Logging out");
        client.logout();
    }
};
