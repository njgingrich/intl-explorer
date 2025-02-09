import { getFormControls } from 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/utilities/form.js';

export function getFieldControl(fieldName) {
  const $form = document.getElementById("options");
  return getFormControls($form).find((control) => control.name === fieldName);
}

export function getFieldValue(fieldName) {
  const $form = document.getElementById("options");

  const data = new FormData($form);
  const val = data.get(fieldName);

  return !val || val === "unset" ? undefined : val;
}

export function setFieldValue(fieldName, value) {
  const $control = getFieldControl(fieldName);

  if ($control.checked !== undefined) {
    $control.checked = value;
  } else {
    $control.value = value;
  }
}
