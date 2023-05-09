import { Strings } from "./Strings";

export function validateReg(value, reg) {
  const regex = new RegExp(reg);
  return regex.test(value);
}
export function CheckNull(value) {
  if (value === '' || value === null) {
    return true
  }
  else {
    return false
  }
}
export function validateEmailMobile(email, mobile) {
  if (!validateReg(email, Strings.EMAIL_REGEX)) {
    return (Strings.VALID_EMAIL);
  }
  else if (!validateReg(mobile, Strings.MOBILE_REGEX)) {
    return (Strings.VALID_CONTACT);
  }

}

