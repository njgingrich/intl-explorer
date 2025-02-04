import { getFormControls } from 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/utilities/form.js';
import { highlightElement } from 'https://cdn.jsdelivr.net/gh/speed-highlight/core/dist/index.js';

/* DOM Elements */
const $timeDisplay = document.getElementById("time-display");
const $codeDisplay = document.getElementById("code-display");
const $form = document.getElementById("options");
const $resetBtn = document.getElementById("reset-form");
const $shareBtn = document.getElementById("share-page");
const $copyBtn = document.getElementById("copy-code");

const $optionsSwitch = document.getElementById("options-switch");
const $basicOptions = document.getElementById("basic-options");
const $fullOptions = document.getElementById("full-options");
const $localeInput = document.getElementById("current-locale");

const DATE_TIME_OPTION_IDS = [
  "year",
  "month",
  "day",
  "dayPeriod",
  "weekday",
  "era",
  "hour",
  "minute",
  "second",
  "fractionalSecondsDigit",
  "timeZoneName",
];

/* Formatter */
function getFieldValue(fieldName) {
  const data = new FormData($form);
  const val = data.get(fieldName);

  return !val || val === "unset" ? undefined : val;
}

function setFieldValue(fieldName, value) {
  const $control = getFormControls($form).find(control => control.name === fieldName);
  if (!$control) {
    console.log({ fieldName, value, $control });
  }

  if ($control.checked !== undefined) {
    $control.checked = value;
  } else {
    $control.value = value;
  }
}

function getOptions() {
  const useFullOptions = $optionsSwitch.checked;

  const advancedOptions = {
    timeZone: getFieldValue("current-tz"),
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
    params.set('useFullOptions', 'true');
  }

  if (Object.keys(options).length === 0) {
    return params;
  }

  const stringified = JSON.stringify(options);
  const encodedParams = window.btoa(stringified);

  params.set('options', encodedParams);
  return params;
}

let formatter;

/* Display */
function updateURL() {
  const params = getOptionsAsParams();

  if (params.size > 0) {
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  } else {
    window.history.replaceState({}, "", window.location.pathname);
  }
}

function initLocale() {
  $localeInput.value = navigator.language;
}

function initOptions() {
  const params = new URLSearchParams(window.location.search);
  const useFullOptions = params.get('useFullOptions');
  setFieldValue('useFullOptions', useFullOptions === 'true' ? true : false);
  
  const encodedOptions = params.get("options");
  if (!encodedOptions) {
    return;
  }
  const paramOptions = JSON.parse(window.atob(encodedOptions));

  for (const [key, val] of Object.entries(paramOptions)) {
    setFieldValue(key, val);
  }
}

function renderTime() {
  $timeDisplay.innerHTML = formatter.format(new Date());
}

function renderOptions() {
  const optionsToDisplay = getOptionsWithoutDefaults();
  const message = `new Intl.DateTimeFormat('${$localeInput.value}', ${JSON.stringify(optionsToDisplay, null, 2)}).format(new Date());`;
  $codeDisplay.innerHTML = message;
  highlightElement($codeDisplay);

  $copyBtn.value = message;
}

function render() {
  const options = getOptions();

  /* imperative UI updates based on form state */
  // hide/show advanced options
  const useFullOptions = $optionsSwitch.checked;
  $basicOptions.classList.toggle("hide", useFullOptions);
  $fullOptions.classList.toggle("hide", !useFullOptions);

  // disable hourCycle if hour12 is set - hour12 overrides hourCycle
  const $el = getFormControls($form).find(control => control.name === "hourCycle");
  $el.disabled = options.hour12 !== undefined;
  
  const locale = $localeInput.value;
  formatter = new Intl.DateTimeFormat(locale, options);

  updateURL();
  renderTime();
  renderOptions();
}

/* INIT */
(async () => {
  const customElementsUsed = ['sl-input', 'sl-radio-button', 'sl-radio-group', 'sl-switch', 'sl-select', 'sl-option', 'sl-copy-button'];
  await Promise.race([
    // Load all custom elements
    Promise.allSettled(customElementsUsed.map(el => customElements.whenDefined(el))),
    // Or, resolve after two seconds
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  document.querySelectorAll('.reduce-fouce').forEach(el => el.classList.remove('reduce-fouce'));
  // await ensureTabs();
  initLocale();
  initOptions();

  $form.addEventListener("change", () => render());
  // tie shoelace element change events to rerender as well
  document.addEventListener('sl-change', () => render());

  $resetBtn.addEventListener("click", () => {
    $form.reset();
    setTimeout(() => {
      initLocale();
      render();
    }, 0);
  });
  $shareBtn.addEventListener("click", () => {});

  setInterval(renderTime, 1000);
  render();
})();
