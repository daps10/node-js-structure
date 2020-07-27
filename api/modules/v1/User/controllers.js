
// var token = Math.round((new Date()).getTime() / 100) + user_id + randomstring.generate(24);
// cryptoLib.encrypt(request.password, shaKey, globals.iv),
var express = require('express');
var common = require('../../../config/common');
const validation = require('./validation');
var user_model = require('./user_model');
// const isAuthenticated = require('../../middlewares/isAuthenticated');
app = express();

class userController {

    /* 
    ** controller for signup users
    */
    static async signup(req, res) {
        //decrypt the request data
        common.decryption(req.body, function (request) {
            if(validation.signupValidation(request,res)) {
               // check unique number or not
                const unique_number_params = {
                    'country_code' : request.country_code,
                    'phone' : request.phone
                }
                // check unique number or not
                user_model.check_unique_number(unique_number_params, (response,msg,code) => {
                    if(response == null) {
                        common.sendresponse(res,code,msg,response);
                    } else {
                        // check unique email or not
                        user_model.check_unique_email({'email' :request.email}, (response,msg,code) => {
                            if(response == null) {
                                common.sendresponse(res,code,msg,response);
                            } else {
                                // signup data
                                user_model.signup(request, (response,msg,code) => {
                                    common.sendresponse(res,code,msg,response);
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /* 
    ** controller for signup users
    */
    static async login(req, res) {
        //decrypt the request data
        common.decryption(req.body, function (request) {
            if(validation.loginValidation(request,res)) {
                // login user
                user_model.login(request, (response,msg,code) => {
                    common.sendresponse(res,code,msg,response);
                });
            }
        });
    }

    /* 
    ** controller for get all users
    */
    static async getAllUser(req, res) {
        //decrypt the request data
        common.decryption(req.body, function (request) {
            if(validation.allUserValidation(request,res)) {
                user_model.getAllUser(request, (response,msg,code) => {
                    if(response == null) {
                        common.sendresponse(res,code,msg,response);
                    } else {
                        common.sendresponse(res,code,msg,response);
                    }
                });
            }
        });
    }

    /* 
    ** controller for get user by id
    */
   static async getUserById(req, res) {
        //decrypt the request data
        user_model.getUserById(req.user_id, (response,msg,code) => {
            if(response == null) {
                common.sendresponse(res,code,msg,response);
            } else {
                common.sendresponse(res,code,msg,response);
            }
        });
    }

    /* 
    ** controller for update user
    */
    static async updateUser(req,res) {
        //decrypt the request data
        common.decryption(req.body, function (request) {
            if(validation.updateUserValidation(request,res)) {
                user_model.updateUser(request,req.user_id, (response,msg,code) => {
                    if(response == null) {
                        common.sendresponse(res,code,msg,response);
                    } else {
                        common.sendresponse(res,code,msg,response);
                    }
                });
            }
        });
    }

    /* 
    ** controller for delete user
    */
    static async deleteUser(req,res) {
        //decrypt the request data
        user_model.deleteUser(req.user_id, (response,msg,code) => {
            if(response == null) {
                common.sendresponse(res,code,msg,response);
            } else {
                common.sendresponse(res,code,msg,response);
            }
        });
    }

    /* 
    ** controller for logout user
    */
    static async logout(req,res) {
        //decrypt the request data
        user_model.logout(req.user_id, (response,msg,code) => {
            if(response == null) {
                common.sendresponse(res,code,msg,response);
            } else {
                common.sendresponse(res,code,msg,response);
            }
        });
    }
}

module.exports = userController;