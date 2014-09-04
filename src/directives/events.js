angular.module("leaflet-directive").directive('events', function ($log, $rootScope, leafletHelpers, leafletEvents) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var isObject = leafletHelpers.isObject,
                leafletScope  = controller.getLeafletScope(),
                events = leafletScope.events,
                availableMapEvents = leafletEvents.getAvailableMapEvents(),
                genDispatchMapEvent = leafletEvents.genDispatchMapEvent;

            controller.getMap().then(function(map) {

                var mapEvents = [];
                var i;
                var eventName;
                var logic = "broadcast";

                if (!isObject(events) || !isObject(events.map)) {
                    // No listeners
                    return;
                }

                // We have a possible valid map object
                // Event propadation logic
                if (events.map.logic !== undefined && events.map.logic !== null) {
                    // We take care of possible propagation logic
                    if (events.map.logic !== "emit" && events.map.logic !== "broadcast") {
                        // This is an error
                        $log.warn("[AngularJS - Leaflet] Available event propagation logic are: 'emit' or 'broadcast'.");
                    } else if (events.map.logic === "emit") {
                        logic = "emit";
                    }
                }
                // Enable / Disable
                var mapEventsEnable = false, mapEventsDisable = false;
                if (events.map.enable !== undefined && events.map.enable !== null) {
                    if (typeof events.map.enable === 'object') {
                        mapEventsEnable = true;
                    }
                }
                if (events.map.disable !== undefined && events.map.disable !== null) {
                    if (typeof events.map.disable === 'object') {
                        mapEventsDisable = true;
                    }
                }
                if (mapEventsEnable && mapEventsDisable) {
                    // Both are active, this is an error
                    $log.warn("[AngularJS - Leaflet] can not enable and disable events at the time");
                } else if (!mapEventsEnable && !mapEventsDisable) {
                    // Both are inactive, this is an error
                    $log.warn("[AngularJS - Leaflet] must enable or disable events");
                } else {
                    // At this point the map object is OK, lets enable or disable events
                    if (mapEventsEnable) {
                        // Enable events
                        for (i = 0; i < events.map.enable.length; i++) {
                            eventName = events.map.enable[i];
                            // Do we have already the event enabled?
                            if (mapEvents.indexOf(eventName) !== -1) {
                                // Repeated event, this is an error
                                $log.warn("[AngularJS - Leaflet] This event " + eventName + " is already enabled");
                            } else {
                                // Does the event exists?
                                if (availableMapEvents.indexOf(eventName) === -1) {
                                    // The event does not exists, this is an error
                                    $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist");
                                } else {
                                    // All ok enable the event
                                    mapEvents.push(eventName);
                                }
                            }
                        }
                    } else {
                        // Disable events
                        mapEvents = availableMapEvents;
                        for (i = 0; i < events.map.disable.length; i++) {
                            eventName = events.map.disable[i];
                            var index = mapEvents.indexOf(eventName);
                            if (index === -1) {
                                // The event does not exist
                                $log.warn("[AngularJS - Leaflet] This event " + eventName + " does not exist or has been already disabled");
                            } else {
                                mapEvents.splice(index, 1);
                            }
                        }
                    }
                }

                for (i = 0; i < mapEvents.length; i++) {
                    eventName = mapEvents[i];
                    map.on(eventName, genDispatchMapEvent(leafletScope, eventName, logic), {
                        eventName: eventName
                    });
                }
            });
        }
    };
});
