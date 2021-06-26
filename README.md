# vaccine-slot-alert
No hassle of checking for vaccine slot availability while working. Configure the requirements and receive browser notifications whenever the vaccine slots are available.


## Setup
* Download the project as ZIP and extract the contents to a folder.
* In the browser enable `Developer mode` at `edge://extensions/` or `chrome://extensions/`.
* Click on `Load Unpacked` and upload the extracted folder. Now the `vaccine-slot-alert` is added to the browser.
* Click on the extension icon, then in the popup window click `Set Filters`.
* Select the filters and click save. The alerts are configured now.
* To stop the alerts click on the `vaccine-slot-alert` icon and click `STOP ALERTS` button at the bottom. 

## Filters
Supported filters are `AGE LIMIT, FEE TYPE, VACCINE NAME, DOSE TYPE, START DATE and DISTRICT`. Currently only filtering based on a single `district` is allowed (not `PINCODE` based), but soon `multiple districts` will be supported.

## Screenshots
#### Main popup
<img width="450" alt="popup" src="https://user-images.githubusercontent.com/9055661/123510749-dc0bca80-d69a-11eb-8c19-f63f45eb0833.PNG">

#### Filters Menu
<img width="563" alt="set-filters" src="https://user-images.githubusercontent.com/9055661/123510747-dada9d80-d69a-11eb-917c-719dd4eacca0.PNG">

## In the background
The `vaccine-slot-alert` checks for slots till next 7 days every `18 seconds` using the cowin public API [/v2/appointment/sessions/public/calendarByDistrict](https://apisetu.gov.in/public/marketplace/api/cowin) and notifies if any of them match the `saved filters` criteria.

### Note
Verified for lastest versions of `Microsft Edge and Google Chrome`. A bug in these chromium based browsers doesn't show notifications if they were disabled at the time of installation, please reinstall the browser(only if one can afford). in such cases and allow notifications during new install.
