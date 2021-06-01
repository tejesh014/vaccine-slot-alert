let color = '#3aa757';
let states_key = "cowin_states";
var alarmName = "slots-alert-v1";

let fetchWithGet = (url) => fetch(url).then((response) => {
  return response.json();
});


chrome.runtime.onInstalled.addListener(() => {
  maybeGetStates();
  console.log('Default background color set to %cgreen', `color: ${color}`);

  // var alarmName = "slots-alert-v1";

  // chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
});


chrome.alarms.onAlarm.addListener(function (alarm) {
  console.log("Got an alarm!", alarm);
  switch (alarm.name) {
    case "clear-slot-alerts-v1":
      chrome.alarms.clear(alarmName);
      chrome.alarms.create(alarmName, { periodInMinutes: 0.3 });
      break;
    case alarmName:
      chrome.storage.local.get("saved_filters", result => {
        fetchSlotsNew(result.saved_filters).then(cts => {
          if (cts.length > 0) {
            chrome.notifications.create('reminder', {
              type: 'basic',
              iconUrl: 'info.png',
              title: 'SLOTS AVAILABLE',
              message: getNotificationText(cts)
            }, function (notificationId) { })
          }
        })
      });

      break;
    default:
      console.log("unhandled alarm ", alarm.name);
  }
});

function getNotificationText(centers) {
  return centers.map((ct) => {
    getCenterText(ct);
  }).join("\n");
}

var getCenterText = (center) => {
  return `${center.name} - ${center.sessions
    .map((s) => `${s.vaccine}(${s.min_age_limit})`)
    .join("-")}`;
};

function fetchSlots() {
  var url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict";
  chrome.storage.local.get("saved_filters", result => {
    console.log("saved filters are ", saved_filters);
    var { district } = result.saved_filters;
    var today = new Date();
    var week = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    fetchWithGet(`${url}?district_id=${district.id}&date=${week}`)
      .then(data => {
        return processResults([data], result.saved_filters);
      });
  });
}

function fetchSlotsNew(filters) {
  var url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict";
  var { district } = filters;
  var today = new Date();
  var week = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  return fetchWithGet(`${url}?district_id=${district.id}&date=${week}`)
    .then(data => {
      return processResults([data], filters);
    });

}

var checkDoseFilter = (session, doses) => {
  var hash = { "dose-1": session.available_capacity_dose1 > 0, "dose-2": session.available_capacity_dose2 > 0 };
  return doses.map(d => hash[d]).reduce((acc, i) => (acc || i), false);
};

var processResults = function (results, filter) {
  var { age_limits, vaccines, fee_types, dose } = filter;
  var centres = [];
  results.map((r) => {
    r.centers = r.centers.map((ct) => ({
      ...ct,
      sessions: ct.sessions.filter(
        (i) => {
          return (age_limits ? age_limits.includes(i.min_age_limit) : true)
            && (vaccines ? vaccines.includes(i.vaccine.toLowerCase()) : true)
            && (fee_types ? fee_types.includes(ct.fee_type.toLowerCase()) : true)
            && (dose ? checkDoseFilter(i, dose) : true)
        }
      ),
    }));
    var cts = r.centers.filter((ct) => {
      return ct.sessions.length > 0;
    });
    centres.push(...cts);
  });
  return centres;
};

let maybeGetStates = () => {
  chrome.storage.local.get(states_key, (resp) => {
    console.log("cowin_states: ", resp);
    if (JSON.stringify(resp) == "{}" || resp.status == "init") {
      chrome.storage.local.set({ cowin_states: { status: "init" } })
      getStates();
    }
  });
};

var getStates = () => {
  let states_url = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
  let districts_url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/";
  fetchWithGet(states_url)
    .then(data => {
      let states = data.states;
      console.log("states : ", states);
      let districtPromises = states.map(state => {
        return fetchWithGet(districts_url + state.state_id)
          .then(resp => ({
            ...state,
            districts: resp.districts
          }))
      });
      Promise.all(districtPromises).then(result => chrome.storage.local.set({ cowin_states: { status: "completed", result } }));
    });
};
