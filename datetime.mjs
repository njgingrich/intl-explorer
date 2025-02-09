import { getFieldControl, getFieldValue, setFieldValue } from "./script/form.mjs";
import { init, getFormatter } from "./script/main.mjs";

/* DOM Elements */
const $timeDisplay = document.getElementById("time-display");
const $optionsSwitch = document.getElementById("options-switch");
const $basicOptions = document.getElementById("basic-options");
const $fullOptions = document.getElementById("full-options");

function getOptions() {
  const useFullOptions = $optionsSwitch.checked;

  const advancedOptions = {
    timeZone: getFieldValue("timeZone"),
    hour12: getFieldValue("hour12") === undefined ? undefined : getFieldValue("hour12") === "true",
    hourCycle: getFieldValue("hourCycle"),
    localeMatcher: getFieldValue("localeMatcher"),
    formatMatcher: getFieldValue("formatMatcher"),
  };

  if (useFullOptions) {
    return {
      year: getFieldValue("year"),
      month: getFieldValue("month"),
      day: getFieldValue("day"),
      dayPeriod: getFieldValue("dayPeriod"),
      weekday: getFieldValue("weekday"),
      era: getFieldValue("era"),
      hour: getFieldValue("hour"),
      minute: getFieldValue("minute"),
      second: getFieldValue("second"),
      fractionalSecondDigits: getFieldValue("fractionalSecondsDigit"),
      timeZoneName: getFieldValue("timeZoneName"),
      ...advancedOptions,
    };
  } else {
    return {
      dateStyle: getFieldValue("dateStyle"),
      timeStyle: getFieldValue("timeStyle"),
      ...advancedOptions,
    };
  }
}

const BUILT_IN_DEFAULTS = {
  localeMatcher: "best fit",
  formatMatcher: "best fit",
};

function getOptionsWithoutDefaults() {
  const options = getOptions();
  // const defaults = new Intl.DateTimeFormat("en-US").resolvedOptions();
  const optionsToDisplay = {};

  // TODO: toggle between rendering the full "resolved options" and the manually selected options?
  for (const key in options) {
    if (options[key] !== BUILT_IN_DEFAULTS[key]) {
      optionsToDisplay[key] = options[key];
    }
  }

  return optionsToDisplay;
}

function getOptionsAsParams() {
  const options = getOptionsWithoutDefaults();

  const params = new URLSearchParams();
  if ($optionsSwitch.checked === true) {
    params.set("useFullOptions", "true");
  }

  if (Object.keys(options).length === 0) {
    return params;
  }

  const stringified = JSON.stringify(options);
  const encodedParams = window.btoa(stringified);

  params.set("options", encodedParams);
  return params;
}

function initOptions() {
  const params = new URLSearchParams(window.location.search);
  const useFullOptions = params.get("useFullOptions");
  setFieldValue("useFullOptions", useFullOptions === "true" ? true : false);

  const encodedOptions = params.get("options");
  if (!encodedOptions) {
    return;
  }
  const paramOptions = JSON.parse(window.atob(encodedOptions));

  for (const [key, val] of Object.entries(paramOptions)) {
    setFieldValue(key, val);
  }
}

function renderTime({formatterType, locale, getOptions}) {
  const formatter = getFormatter({formatterType, locale, options: getOptions()});
  $timeDisplay.innerHTML = formatter.format(new Date());
}

function onComplete({formatterType, locale, getOptions}) {
  initOptions();
  setInterval(renderTime.bind(null, {formatterType, locale, getOptions}), 1000);
}

function onRender({ formatterType, locale, getOptions }) {
  const formOptions = getOptions();
  const useFullOptions = $optionsSwitch.checked;
  $basicOptions.classList.toggle("hide", useFullOptions);
  $fullOptions.classList.toggle("hide", !useFullOptions);

  // disable hourCycle if hour12 is set - hour12 overrides hourCycle
  const $el = getFieldControl('hourCycle');
  $el.disabled = formOptions.hour12 !== undefined;

  renderTime({formatterType, locale, getOptions});
}

function getUrlParams() {
  const params = getOptionsAsParams();
  return params;
}

init({ formatterType: "DateTimeFormat", getOptions, onRender, onComplete, getUrlParams });
