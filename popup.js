var PopupModule = (function () {
  var slot_alerts_alarm = "slots-alert-v1";
  var handleOptionsClick = () => {
    let changeColor = document.getElementById("options");

    changeColor.addEventListener("click", async () => {
      chrome.runtime.openOptionsPage();
    });
  };

  var handleStartAlertsClick = () => {
    let startAlertBtn = document.getElementById("start_alerts");
    startAlertBtn.addEventListener("click", async () => {
      chrome.alarms.create("create-slot-alert-v1", { delayInMinutes: 0.1 });
      showHideAlertActionButton("start_alerts", false);
      showHideAlertActionButton("stop_alerts", true);
    });
  };

  var handleStopAlertsClick = () => {
    let stopAlertBtn = document.getElementById("stop_alerts");
    stopAlertBtn.addEventListener("click", async () => {
      chrome.alarms.create("clear-slot-alerts-v1", { when: 0 });
      showHideAlertActionButton("stop_alerts", false);
      showHideAlertActionButton("start_alerts", true);
    });
  };

  var showHideAlertActionButton = (btn_id, show) => {
    let alertBtn = document.getElementById(btn_id);
    show ? alertBtn.classList.add("show") : alertBtn.classList.remove("show");
  };

  var showExistingFilters = () => {
    chrome.storage.local.get("saved_filters", ({ saved_filters }) => {
      var $filters_table_body = document.getElementById("filters_table_body");
      if (saved_filters) {
        console.log("saved_dilters ", saved_filters);
        var filtersVM = getFiltersVM(saved_filters);
        for (var label in filtersVM) {
          var row = document.createElement("tr");
          var row_label = document.createElement("th");
          row_label.setAttribute("scope", "row");
          row_label.innerHTML = label;
          var row_value = document.createElement("td");
          row_value.innerHTML = filtersVM[label];
          row.appendChild(row_label);
          row.appendChild(row_value);
          $filters_table_body.appendChild(row);
        }
      } else {
        console.log("No saved filters");
        var $no_saved_filters = document.getElementById("no_saved_filters");
        $no_saved_filters.classList.add("show");
      }
    });
  };

  var handleAlertActionBtnsDisplay = () => {
    chrome.alarms.get(slot_alerts_alarm, (alarm) => {
      if (alarm) {
        showHideAlertActionButton("stop_alerts", true);
      } else {
        showHideAlertActionButton("start_alerts", true);
      }
    });
  };

  var getFiltersVM = (saved_filters) => {
    var { age_limits, district, state, dose, fee_types, vaccines } =
      saved_filters;
    return {
      "Age Limits": maybeGetArrayString(age_limits),
      District: district.name,
      State: state.name,
      Doses: maybeGetArrayString(dose),
      "Fee types": maybeGetArrayString(fee_types),
      Vaccines: maybeGetArrayString(vaccines),
    };
  };

  var maybeGetArrayString = (arr) => {
    return arr ? arr.join(", ") : "";
  };

  var init = function () {
    handleOptionsClick();
    handleStartAlertsClick();
    handleStopAlertsClick();
    handleAlertActionBtnsDisplay();
    showExistingFilters();
  };
  return init;
})();

document.addEventListener("DOMContentLoaded", function (event) {
  PopupModule();
});
