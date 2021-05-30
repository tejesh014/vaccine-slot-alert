/* creator: tejesh konchada */
var Home = (function () {
  var url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict";
  var districtIds = [8, 11];

  var getSlots = function () {
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
  };

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

  var handleStartClick = function () {
    document.getElementById("start").onclick = function () {
      cts_dom = document.getElementById("centers_list");
      cts_dom.innerHTML = "";

      getSlots().then((cts) => {
        if(cts.length == 0) {
          var textNode = document.createTextNode("NO Centres available");
          cts_dom.appendChild(textNode);
          return;
        }
        cts.map((ct) => {
          var node = document.createElement("LI");
          var paragraphNode = document.createElement("small");
          var textNode = document.createTextNode(getCenterText(ct));
          paragraphNode.appendChild(textNode);
          node.appendChild(paragraphNode);
          cts_dom.appendChild(node);
        });
      });
    };
  };

  var getCenterText = (center) => {
    return `${center.name} - ${center.sessions
      .map((s) => `${s.vaccine}(${s.min_age_limit})`)
      .join("-")}`;
  };

  var init = function () {
    handleStartClick();
  };

  return init;
})();

document.addEventListener("DOMContentLoaded", function (event) {
  Home();
});
