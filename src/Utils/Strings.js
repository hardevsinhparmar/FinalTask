export const Strings = {
    TXT_ENTER_VALUE: 'Please Insert value',
    ENTER_MOBILENO: 'Please Enter Mobile No',
    ENTER_NAME: 'Please Enter Name',
    ENTER_EMAIL: 'Please Enter Email',
    ENTER_PASSWORD: 'Please Enter Password',
    ALL_REQUIRE: 'All field are require',
    VALID_EMAIL: 'Enter valid Email',
    VALID_CONTACT: 'Enter valid Contact with 10 digits',
    VALID_PASSWORD: 'Enter valid Password',
    ONLY_TEXT_REGEX: /[-#=*;,.<>\{\}\[\]\\\/^0-9]/g,
    ONLY_NUMBER_REGEX: /[A-Za-z- =#*;,.<>\{\}\[\]\\\/]/g,
    VALID_NAME: 'Enter valid Name',
    VALID_PASSWORD_LENGTH: 'Password is less than 8 characters',
    COFIRM_PASSWORD_MATCH: 'Password and Confirm Password do not match',
    EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    MOBILE_REGEX: /^[0-9]{10}$/,
    PASSWORD_REGEX: new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")

}