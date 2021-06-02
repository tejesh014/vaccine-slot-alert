var PopupModule = (function () {
  var handleOptionsClick = () => {
    let changeColor = document.getElementById("options");

    changeColor.addEventListener("click", async () => {
      chrome.runtime.openOptionsPage();
    });
  };

  var showExistingFilters = () => {
    chrome.storage.local.get("saved_filters", ({ saved_filters }) => {
      var $filters_table_body = document.getElementById("filters_table_body");
      if (saved_filters) {
        console.log("saved_dilters ", saved_filters);
        var filtersVM = getFiltersVM(saved_filters);
        for(var label in filtersVM) {
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

  var getFiltersVM = (saved_filters) => {
    var {age_limits, district, state, dose, fee_types, vaccines} = saved_filters;
    return {
      "Age Limits": maybeGetArrayString(age_limits),
      "District": district.name,
      "State": state.name,
      "Doses": maybeGetArrayString(dose),
      "Fee types": maybeGetArrayString(fee_types),
      "Vaccines": maybeGetArrayString(vaccines)
    }
  };

  var maybeGetArrayString = (arr) => {
    return (arr ? arr.join(", ") : "");
  }; 

  var init = function () {
    handleOptionsClick();
    showExistingFilters();
  };
  return init;
})();

document.addEventListener("DOMContentLoaded", function (event) {
  PopupModule();
});
