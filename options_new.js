var OptionsModule = (function () {
  var states;

  var filters = {
    state: null,
    district: null,
    age_limits: null,
    vaccines: null,
    fee_types: null,
    dose: null,
    from_date: null
  };

  var getStates = () => {
    chrome.storage.local.get("cowin_states", function (res) {
      if (res.cowin_states.status == "init") {
        setTimeout(function () {
          getStates();
        }, 0);
      } else {
        states = res.cowin_states.result;
        populateStates();
      }
    });
  };

  var populateStates = () => {
    let stateSelect = document.getElementById("states");
    states.forEach((state) => {
      var option = document.createElement("option");
      var { state_id, state_name } = state;
      option.value = state_id;
      option.innerHTML = state_name;
      stateSelect.appendChild(option);
    });
    let { state_id, state_name } = states[0];
    filters = {
      ...filters,
      state: {
        id: state_id,
        name: state_name,
      },
    };
    populateDistricts(states[0].districts);
  };

  var handleStateChange = function () {
    document.getElementById("states").addEventListener("change", (e) => {
      let state = states.filter(
        (state) => state.state_id == parseInt(e.target.value)
      )[0];
      filters = {
        ...filters,
        state: {
          id: state.state_id,
          name: state.state_name,
        },
      };
      populateDistricts(state.districts);
    });
  };

  var populateDistricts = function (districts) {
    let districtSelect = document.getElementById("districts");
    districtSelect.innerHTML = "";
    districts.forEach((district) => {
      var option = document.createElement("option");
      var { district_id, district_name } = district;
      option.value = district_id;
      option.innerHTML = district_name;
      districtSelect.appendChild(option);
    });
    let { district_id, district_name } = districts[0];
    filters = {
      ...filters,
      district: {
        id: district_id,
        name: district_name,
      },
    };
  };

  var handleDistrictChange = function () {
    document.getElementById("districts").addEventListener("change", (e) => {
      let districtSelect = document.getElementById("districts");
      filters = {
        ...filters,
        district: {
          id: parseInt(e.target.value),
          name: districtSelect.options[districtSelect.selectedIndex].text,
        },
      };
      console.log(filters);
    });
  };

  var handleFeeTypeChange = function () {
    var filters = document.getElementsByClassName("fee_type_filter");
    for (var i = 0; i < filters.length; i++) {
      filters[i].addEventListener("click", (e) => {
        let filter_val = e.target.value;
        let filter_field = "fee_types";
        if (e.currentTarget.checked) {
          addValue(filter_field, filter_val);
        } else {
          removeValue(filter_field, filter_val);
        }
      });
    }
  };

  var handleAgeLimitChange = function () {
    var filters = document.getElementsByClassName("age_limit_filter");
    for (var i = 0; i < filters.length; i++) {
      filters[i].addEventListener("click", (e) => {
        let filter_val = parseInt(e.target.value);
        let filter_field = "age_limits";
        if (e.currentTarget.checked) {
          addValue(filter_field, filter_val);
        } else {
          removeValue(filter_field, filter_val);
        }
      });
    }
  };

  var handleVaccineChange = function () {
    var filters = document.getElementsByClassName("vaccine_filter");
    for (var i = 0; i < filters.length; i++) {
      filters[i].addEventListener("click", (e) => {
        let filter_val = e.target.value;
        let filter_field = "vaccines";
        if (e.currentTarget.checked) {
          addValue(filter_field, filter_val);
        } else {
          removeValue(filter_field, filter_val);
        }
      });
    }
  };

  var handleDoseChange = function () {
    var filters = document.getElementsByClassName("dose_filter");
    for (var i = 0; i < filters.length; i++) {
      filters[i].addEventListener("click", (e) => {
        let filter_val = e.target.value;
        let filter_field = "dose";
        if (e.currentTarget.checked) {
          addValue(filter_field, filter_val);
        } else {
          removeValue(filter_field, filter_val);
        }
      });
    }
  };

  var handleFromDateChange = function() {
    var dateFilter = document.getElementById("from_date");
    dateFilter.addEventListener("change", (e) => {
      let from_date_obj = e.target.valueAsDate;
      console.log(from_date_obj);
      filters = {
        ...filters,
        from_date: from_date_obj.toJSON(),
      };
    })
  };

  var addValue = function (field_name, filter_value) {
    var cur = filters[field_name];
    if (cur) {
      cur.add(filter_value);
    } else {
      filters[field_name] = new Set([filter_value]);
    }
  };

  var removeValue = function (field_name, filter_value) {
    var cur = filters[field_name];
    if (cur) {
      cur.delete(filter_value);
    }
  };

  var validateFilters = function () {
    return filters.state && filters.district;
  };

  var handleSaveFiltersClick = function () {
    document.getElementById("save_filters").addEventListener("click", (e) => {
      if (validateFilters()) {
        chrome.storage.local.set(
          {
            saved_filters: {
              ...filters,
              age_limits: toArray(filters.age_limits),
              vaccines: toArray(filters.vaccines),
              fee_types: toArray(filters.fee_types),
              dose: toArray(filters.dose),
            },
          },
          function () {
            alert("Filters updated and Alerts ON!");
            chrome.alarms.create("create-slot-alert-v1", { delayInMinutes: 0.1 });
          }
        );
      }
    });
  };

  var toArray = (set_val) => {
    return set_val && set_val.size > 0 ? Array.from(set_val) : null;
  };

  var init = function () {
    getStates();
    handleVaccineChange();
    handleAgeLimitChange();
    handleFeeTypeChange();
    handleStateChange();
    handleDistrictChange();
    handleDoseChange();
    handleFromDateChange();
    handleSaveFiltersClick();
  };

  return init;
})();

document.addEventListener("DOMContentLoaded", function (event) {
  OptionsModule();
});
