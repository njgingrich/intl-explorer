import { highlightElement } from 'https://cdn.jsdelivr.net/gh/speed-highlight/core/dist/index.js';

// Default DOM elements
// All pages should have these elements declared

const $form = document.getElementById("options");
const $resetBtn = document.getElementById("reset-form");
const $shareBtn = document.getElementById("share-page");
const $copyBtn = document.getElementById("copy-code");
const $localeInput = document.getElementById("current-locale");
const $output = document.getElementById("output-display");

const BUILT_IN_DEFAULTS = {
  'DateTimeFormat': {
    localeMatcher: "best fit",
    formatMatcher: "best fit",
  }
}

function initLocale() {
  $localeInput.value = navigator.language;
  return $localeInput.value;
}

function getLocale() {
  return $localeInput.value;
}

function getOptionsWithoutDefaults({formatterType, options}) {
  const optionsToDisplay = {};

  for (const key in options) {
    if (options[key] !== BUILT_IN_DEFAULTS[formatterType][key]) {
      optionsToDisplay[key] = options[key];
    }
  }

  return optionsToDisplay;
}

function getOutputMessage({formatterType, options}) {
  switch (formatterType) {
    case 'DateTimeFormat':
      return `new Intl.DateTimeFormat('${$localeInput.value}', ${JSON.stringify(options, null, 2)}).format(new Date());`;
  }

  return '';
}

export function getFormatter({formatterType, locale, options}) {
  switch (formatterType) {
    case 'DateTimeFormat':
      return new Intl.DateTimeFormat(locale, options);
  }
}

function updateURL(params) {
  if (params.size > 0) {
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  } else {
    window.history.replaceState({}, "", window.location.pathname);
  }
}

function renderOutput({formatterType, formOptions}) {
  const options = getOptionsWithoutDefaults({formatterType, options: formOptions});
  const message = getOutputMessage({formatterType, options});

  $output.innerHTML = message;
  highlightElement($output);
  $copyBtn.value = message;
}

function render({formatterType, formOptions, getOptions, locale, onRender, getUrlParams} = {}) {
  updateURL(getUrlParams());
  renderOutput({formatterType, formOptions});
  onRender?.({formatterType, formOptions, getOptions, locale, onRender, getUrlParams});
}

function getRenderOptions({formatterType, getOptions, onRender, getUrlParams}) {
  const formOptions = getOptions();
  const locale = getLocale();

  return {formatterType, formOptions, getOptions, locale, onRender, getUrlParams};
}

export async function init({formatterType, getOptions, onComplete, onRender, getUrlParams} = {}) {
  const customElementsUsed = [
    "sl-input",
    "sl-radio-button",
    "sl-radio-group",
    "sl-switch",
    "sl-select",
    "sl-option",
    "sl-copy-button",
  ];
  await Promise.race([
    // Load all custom elements
    Promise.allSettled(customElementsUsed.map((el) => customElements.whenDefined(el))),
    // Or, resolve after two seconds
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  document.querySelectorAll(".reduce-fouce").forEach((el) => el.classList.remove("reduce-fouce"));
  initLocale();

  $form.addEventListener("change", () => {
    render(getRenderOptions({formatterType, getOptions, onRender, getUrlParams}));
  });
  // tie shoelace element change events to rerender as well
  document.addEventListener("sl-change", () => {
    render(getRenderOptions({formatterType, getOptions, onRender, getUrlParams}));
  });
  $resetBtn.addEventListener("click", () => {
    $form.reset();
    setTimeout(() => {
      initLocale();
      render(getRenderOptions({formatterType, getOptions, onRender, getUrlParams}));
    }, 0);
  });
  $shareBtn.addEventListener("click", () => {});

  render(getRenderOptions({formatterType, getOptions, onRender, getUrlParams}));
  onComplete?.(getRenderOptions({formatterType, getOptions, onRender, getUrlParams}));
}
