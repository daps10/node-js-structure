const common = require('../../../config/common');
const { t } = require('localizify');


module.exports = {
    /* 
    ** Validation rules and messages for add user
    */
    signupValidation :  (request, response) => {
        var rules = {
            name : 'required',
            email : 'required',
            country_code :'required',
            phone : 'required',
            address : 'required',
            device_type : 'required',
            device_name : 'required',
            device_token : 'required',
            os_version : 'required',
            ip : 'required',
            uuid : 'required',
        }
        const messages = {
            'email': t('email'),
        }
        // check validate or not
        if(common.checkValidationRules(request,response,rules, messages)) {
            return true;
        } else {
            return false;
        }
    },

    /* 
    ** Validation rules and messages for add user
    */
    loginValidation :  (request, response) => {
        var rules = {
            email : 'required',
            password : 'required',
            device_type : 'required',
            device_name : 'required',
            device_token : 'required',
            os_version : 'required',
            ip : 'required',
            uuid : 'required',
        }
        const messages = {
            'email': t('email'),
        }
        // check validate or not
        if(common.checkValidationRules(request,response,rules, messages)) {
            return true;
        } else {
            return false;
        }
    },

    /* 
    ** Validation rules and messages for update user
    */
    allUserValidation :  (request, response) => {
        var rules = {
            page : 'required',
        }
        const messages = {
            'email': t('email'),
        }
        // check validate or not
        if(common.checkValidationRules(request,response,rules, messages)) {
            return true;
        } else {
            return false;
        }
    }, 


    /* 
    ** Validation rules and messages for update user
    */
    updateUserValidation :  (request, response) => {
        var rules = {
            name : 'required',
        }
        const messages = {
            'email': t('email'),
        }
        // check validate or not
        if(common.checkValidationRules(request,response,rules, messages)) {
            return true;
        } else {
            return false;
        }
    }, 
}