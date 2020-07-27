var con = require('../../../config/database');
var globals = require('../../../config/constants');
var common = require('../../../config/common');
var asyncLoop = require('node-async-loop');
var dateFormat = require('dateformat');
// url-safe base64
var _randomhash = require('crypto-toolkit').RandomHash('base64-urlsafe');
var cryptoLib   = require('cryptlib');
var dateFormat = require('dateformat');
var shaKey      = cryptoLib.getHashSha256(globals.key, 32);
const {t} = require('localizify');

class userModel {

    /*
     ** Function for check uniqness of given value
     */
    static async check_unique_number(unique_number_params,callback) { 
        // Query for get date unique or not
        var select = (typeof unique_number_params.type != 'undefined' && unique_number_params.type=='edit') ? "SELECT * FROM tbl_user WHERE id != '" + unique_number_params.user_id + "' AND contry_code= ? AND phone= ?" : "SELECT * FROM tbl_user WHERE country_code = ? AND phone= ?";
        
        con.query(select, [unique_number_params.country_code,unique_number_params.phone], function(err, result){
            if(!err) {
                if(result.length > 0) {
                    callback(null, t('text_user_exist', {field: unique_number_params.country_code+' '+ unique_number_params.phone}), '0');
                } else {
                    callback(true, t('text_user_is_available', { field: unique_number_params.country_code+' '+ unique_number_params.phone }), '0');
                }
            } else {
                common.print_log(err.sqlMessage)
                callback(null, t('text_user_err'), '0');
            }
        });
    }
    
    /*
     ** Function for check uniqness of given value
     */
    static async check_unique_email (unique_email_params,callback) {
        // Query for get date unique or not
        var select = (typeof unique_email_params.type != 'undefined' && unique_email_params.type=='edit') ? "SELECT * FROM tbl_user WHERE status!='Deleted' AND id != '" + unique_email_params.user_id + "' AND email= ?" : "SELECT * FROM tbl_user WHERE status!='Deleted' AND email= ?";
        
        con.query(select, [unique_email_params.email], function(err, result){
            if(!err) {
                if(result.length > 0) {
                    callback(null, t('text_user_exist', { field: unique_email_params.email }), '0');
                } else {
                    callback(true, t('text_user_is_available', { field: unique_email_params.email }), '0');
                }
            } else {
                common.print_log(error)
                callback(null, t('text_user_err'), '0');
            }
        });
    }

    /*
     ** Function for signup of given value
     */
    static async signup (request,callback) {
        const params = {
            name : request.name,
            email : request.email,
            password : cryptoLib.encrypt(request.password, shaKey, globals.iv),
            country_code : request.country_code,
            phone : request.phone,
            address : request.address,
            status : 'Active'
        }
        // add params values into tbl_user
        con.query("INSERT INTO tbl_user SET ?",params, function(err,result){
            if(err) { 
                common.print_log(err.sqlMessage)
                callback(null, t('text_user_err'), '0');
            } else {
                const user_id = result.insertId;
                // add user device info
                userModel.add_device_info(request,user_id, (token) => {
                    /* Get the user details */
                    userModel.getUserById(user_id, (response, msg, code) => {
                        if (response == null) {
                            callback(null, t('text_user_err'), '0');
                        } else {
                            response = Object.assign( response, {
                                token: token
                            });
                            callback(response, t('text_user_signup_success'), '1');
                        }
                    });
                });
            }
        });
    }

    /*
     ** Function for login of given value
     */
    static async login (request, callback) {
        const password = cryptoLib.encrypt(request.password, shaKey, globals.iv);
        con.query("SELECT * FROM tbl_user WHERE email='"+request.email+"' AND password='"+password+"'", function(err, result){
            if(!err) {
                if(result.length > 0) {
                    if(result[0].status == 'Inactive') {
                        callback(null, t('text_user_login_inactive'), 3);
                    } else if(result[0].status == 'Deleted') {
                        callback(null, t('text_user_login_deleted'), 3);
                    } else {
                        // add user device info
                        userModel.add_device_info(request,result[0].id, (token) => {
                            /* Get the user details */
                            userModel.getUserById(result[0].id, (response, msg, code) => {
                                if (response == null) {
                                    callback(null, t('text_user_err'), '0');
                                } else {
                                    var login_params = {
                                        last_login: dateFormat('yyyy-mm-dd HH:MM:ss'),
                                        login: "Online"
                                    };
                                    common.update_user(result[0].id,login_params)

                                    response = Object.assign( response, {
                                        token: token
                                    });
                                    callback(response, t('text_user_login_success'), '1');
                                }
                            });
                        });
                    }
                } else {
                    callback(null, t('text_user_login_new'), '11');
                }
            } else {
                common.print_log(err.sqlMessage);
                callback(null, t('text_user_login_fail'), '0');
            }
        });
    }

    /*
     ** Function for add device info of given value
     */
    static async add_device_info(request, user_id, callback) {
        const token = _randomhash.sha256();
        var params = {
            user_id: user_id,
            token: token,
            device_type: request.device_type,
            device_name: request.device_name,
            os_version: request.os_version,
        };
        if (request.ip != undefined && request.ip != '') {
            params.ip = request.ip;
        }
        if (request.uuid != undefined && request.uuid != '') {
            params.uuid = request.uuid;
        }
        if (request.device_token != undefined && request.device_token != '') {
            params.device_token = request.device_token;
        }
        con.query("SELECT * FROM tbl_user_device WHERE user_id='"+user_id+"'", function(err,result){
            if(!err) {       
                // check result length avail or not
                if(result.length > 0) {
                    con.query("UPDATE tbl_user_device SET ? WHERE user_id ='"+user_id+"'",params,function(error,result,fields) { 
                        if(err)
                            common.print_log(err)
                        else callback(token);
                    });
                } else {
                    con.query('INSERT tbl_user_device SET ? ', params, function (err, result, fields) {
                        if(err)
                            common.print_log(err)
                        else callback(token);
                    });
                }
            } else {
                common.log(err);
                callback(response, t('text_user_err'), '0');
            }
        });
        
        
    }

    /* 
    ** sql query with response for get all users
    */
    static async getAllUser(request,callback) {
        const skip = (request.page - 1) * globals.per_page;
        con.query("SELECT * FROM tbl_user WHERE status = 'Active' order by id desc LIMIT " + parseInt(skip)  + "," + parseInt(globals.per_page) + "", function(err,result) {
            if(!err) {
                if(result.length > 0) {
                    callback(result, t('text_users_list_found'), '1');
                } else {
                    callback(null, t('text_users_list_not_found'), '2');
                }
            } else {
                common.print_log(error)
                callback(null, t('text_user_err'), '0');
            }
        })
    }

    /* 
    ** sql query with response for get user by id
    */
    static async getUserById(id, callback) {
        con.query(`SELECT * FROM tbl_user WHERE id='${id}' AND status = 'Active'`, function (err,result) {
            if(!err) {
                if(result.length > 0) {
                    callback(result[0], t('text_user_detail_found'), '1');
                } else {
                    callback(null, t('text_user_not_found'), '2');
                }
            } else {
                common.print_log(err)
                callback(null, t('text_user_err'), '0');
            }
        });
    }

    /* 
    ** sql query with response  for add user
    */
    static async addUser(req, callback) {
        con.query("INSERT INTO tbl_user(name,email,country_code,phone,address)VALUES('"+req.name+"','"+req.email+"','"+req.country_code+"','"+req.phone+"','"+req.address+"')",function(error,result,fields){
            // console.log(this.sql)
            if(!error) {
                callback(null, t('text_user_signup_success'), '1');
            } else {
                common.print_log(error)
                callback(null, t('text_user_insert_err'), '0');
            }
        });
    }
    
    /* 
    ** sql query with response  for update user
    */
    static async updateUser(request,user_id,callback) {
        con.query(`SELECT * FROM tbl_user WHERE id=${user_id}`, function(err,result,fields){
            if (!err) {
                if(result.length > 0) {
                    let params = {
                        name : (request.name) ?  request.name: result[0].name,
                        email : (request.email) ?  request.email: result[0].email,
                        country_code : (request.country_code) ?  request.country_code: result[0].country_code,
                        phone : (request.phone) ?  request.phone: result[0].phone,
                        address : (request.address) ?  request.address: result[0].address,
                        updatedate : dateFormat('yyyy-mm-dd HH:MM:ss'),
                    }
                    con.query(`UPDATE tbl_user SET ? WHERE id ='${user_id}'`,params,(error,result,fields) => {
                        if(!error) {
                            callback(null, t('text_user_edit_profile_success'), '1');
                        } else {
                            common.print_log(error)
                            callback(null, t('text_user_edit_profile_fail'), '0');
                        }
                    });
                } else {
                    callback(null, t('text_user_not_found'), '0');
                }
            } else {
                common.print_log(error)
                callback(null, t('text_user_insert_err'), '0');
            }
        });
        
    }

    /* 
    ** sql query with response for delete user
    */
    static async deleteUser(id, callback) {
        con.query(`SELECT * FROM tbl_user WHERE id=${id}`, function(err,result,fields) {
            if (!err) {
                con.query(`UPDATE tbl_user SET status='Deleted',login='Offline', updatedate='${dateFormat('yyyy-mm-dd HH:MM:ss')}' WHERE id ='${id}'`,(error,result,fields) => {
                    if(!error) {
                        con.query(`DELETE FROM tbl_user_device WHERE user_id = '${id}'`);
                        callback(null, t('text_user_deleted_successfully'), '1');
                    } else {
                        common.print_log(error)
                        callback(null, t('text_user_edit_profile_fail'), '0');
                    }
                });
            } else {
                common.print_log(err.sqlMessage)
                callback(null, t('text_user_insert_err'), '0');
            }
        });    
    }

    /* 
    ** sql query with response for logout user
    */
    static async logout(id, callback) {
        var params = {
            login: 'Offline',
        }
        common.update_user(id, params);
        common.delete_user_token(id);
        callback(true, t('text_user_logout'), '1'); 
    }
}

module.exports = userModel;


