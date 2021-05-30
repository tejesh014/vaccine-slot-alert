let color = '#3aa757';
let states_key = "cowin_states";

let fetchWithGet = (url) => fetch(url).then((response) => {
  return response.json();
});


chrome.runtime.onInstalled.addListener(() => {
  maybeGetStates();
  console.log('Default background color set to %cgreen', `color: ${color}`);

  // var alarmName = "slots-alert";

  // chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
});


// chrome.alarms.onAlarm.addListener(function (alarm) {
//   console.log("Got an alarm!", alarm);
//   if (alarm.name == "slots-alert") {
//     fetchSlots().then(cts => {
//       if (cts.length > 0) {
//         chrome.notifications.create('reminder', {
//           type: 'basic',
//           iconUrl: 'info.png',
//           title: 'SLOTS AVAILABLE',
//           message: 'No centers'
//         }, function (notificationId) { })
//       }
//     })
//   }
// });

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
  var districtIds = [8, 11];
  var promises = districtIds.map((dist) => {
    var today = new Date();
    //   today.setDate(today.getDate() + 7);
    var week = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    return fetch(`${url}?district_id=${dist}&date=${week}`).then((response) =>
      response.json()
    );
  });
  return Promise.all(promises).then((results) => {
    return processResults(results);
  });
}

var processResults = function (results) {
  var centres = [];
  results.map((r) => {
    r.centers = r.centers.map((ct) => ({
      ...ct,
      sessions: ct.sessions.filter(
        (i) => i.available_capacity_dose1 > 1 && i.min_age_limit == 18
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
  console.log("AT getStates");
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
