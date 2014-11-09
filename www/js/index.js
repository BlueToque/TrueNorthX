/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
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
		console.log('Initialized');
        self.showAlert("Initialized","Info");
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
        self.showAlert("Initialized","Info");
        app.receivedEvent('deviceready');
        
		$('#getIt').click(function() {
			console.log('Clicked');
			GeoLocate(
				function(coords){
					console.log('Got coordinates '+coords.latitude+', '+coords.longitude);
					$('.lat-view').html(coords.latitude);
					$('.long-view').html(coords.longitude);
				}, 
				function(error){
					console.log('Error getting location: '+error);
					showAlert(error,"Error");
				});
		});
    },
	log: function (message)
	{
		$('#update').prepend('<tr><td>'+ new Date().toString()+ 'td><td>'+message+'</td></tr>');
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        lof('Received Event: ' + id);
    },
    showAlert: function (message, title) {
		if (navigator.notification) {
			navigator.notification.alert(message, null, title, 'OK');
		} else {
			alert(title ? (title + ": " + message) : message);
    }
},
};
