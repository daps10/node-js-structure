var con         = require('./database');
var globals     = require('./constants');
var cryptoLib   = require('cryptlib');
var shaKey      = cryptoLib.getHashSha256(globals.key, 32); // This line is not needed on Android or iOS. Its already built into CryptLib.m and CryptLib.java
var dateFormat  = require('dateformat');
var asyncLoop   = require('node-async-loop');
var nodemailer  = require('nodemailer');
var Validator = require('Validator');
const { t }     = require('localizify');

var Validate = { 
    /*
    * Validate token
    */
    validate_token: function(req,res,callback){
        var path_data = req.path.split("/");
        // ,"get_vehicle_list","get_city_list"
        var method = new Array ("signup","login");
        var api_key = cryptoLib.decrypt(req.headers['api-key'], shaKey, globals.iv);
        if (api_key == globals.api_key) {
            if (method.indexOf(path_data[path_data.length-1]) === -1) {
                if (req.headers['token']) {
                    con.query("SELECT * FROM tbl_user_device WHERE token = '"+cryptoLib.decrypt(req.headers['token'], shaKey, globals.iv)+"' ", function (err, result) {
                        if(result.length > 0)
                        {
                            if (result[0] == undefined || result[0] == ''){
                                response_data = {
                                    code: '-1',
                                    message: 'Invalid token',
                                    data: ''
                                };
                                Validate.encryption(response_data,function(responseData){
                                    res.status(401);
                                    res.json(responseData);
                                })
                            }
                            else {
                                req.user_id = result[0].user_id
                                callback();
                            }
                        }
                        else
                        {
                            response_data = {
                                code: '-1',
                                message: 'Invalid token',
                                data: ''
                            };
                            Validate.encryption(response_data,function(responseData){
                                res.status(401);
                                res.json(responseData);
                            })
                        }
                    });
                }
                else{
                    response_data = {
                        code: '-1',
                        message: 'Invalid token',
                        data: ''
                    };
                    Validate.encryption(response_data,function(responseData){
                        res.status(401);
                        res.json(responseData);
                    })
                }
            }
            else{
                callback();
            }
        }
        else{
            response_data = {
                code: '-1',
                message: 'Invalid api-key',
                data: ''
            };
            Validate.encryption(response_data,function(responseData){
                res.status(401);
                res.json(responseData);
            })
        }
    },

    /*
    * Request decryption
    */
    decryption: function(req,callback){
        try{
            if(req!=undefined && Object.keys(req).length !== 0){
                var request = JSON.parse(cryptoLib.decrypt(req, shaKey, globals.iv));
                callback(request);
            }
            else{
                callback('');
            }
        }
        catch (err) {
            // console.log(err)
            callback([]);
        }
    },
    
    /*
    * Request encryption
    */
    encryption: function(req,callback){
        var response = cryptoLib.encrypt(JSON.stringify(req), shaKey, globals.iv);
        callback(response);
    },

    /*
    * Send sms through given third party  
    */
    send_sms: function(req,callback) {
        callback(true);
    },
    
    /*
    ** Function to check validation rules for all api's 
    */
   checkValidationRules: function(request,response,rules,messages){
        var v = Validator.make(request,rules,messages);
        if (v.fails()) {
            var Validator_errors = v.getErrors();
            for (var key in Validator_errors) {
                error = Validator_errors[key][0];
                break;
            }
            response_data = {
                code: '0',
                message: error
            };
            Validate.encryption(response_data, function (responseData) {
                response.status(200);
                response.json(responseData);
            })
            return false;
        } else {
            return true;
        }
    },

    /*
    * Function to return response for any api
    */
    sendresponse: function(res,responsecode,responsemessage,responsedata){
        if (responsedata != null) {
            response_data = {
                code: responsecode,
                message: responsemessage,
                data: responsedata
            };  
            Validate.encryption(response_data,function(response){
                res.status(200);
                res.json(response);
            })
        } else {
            response_data = {
                code: responsecode,
                message: responsemessage
            };  
            Validate.encryption(response_data,function(response){
                res.status(200);
                res.json(response);
            })
        }
    },

    /*
    * log print  
    */
    print_log : function(req, callback) {
        console.log(req);
    },

    /*
    ** Function to add data in to table
    */
    add_to_table: function(params,table){
        con.query('INSERT INTO '+table+' SET ?', params);
    },

    /*
    ** Function to update user data in to table
    */
    update_user: function(user_id,params){
        con.query("UPDATE tbl_user SET ? WHERE id = "+user_id,params);
    },

    /*
    ** Function to delete the user token form user deivce tabel
    */
    delete_user_token(user_id){
        con.query("UPDATE tbl_user_device SET ? WHERE user_id = '"+user_id+"'",{"token":"","device_token":""});
    },

    /*
    * Gate date difference
    */
    get_date_difference : function ( params,callback ) {
        var moment = require('moment');
        date2 = params.datetime;
        var then = moment(date2, "YYYY-MM-DD'T'HH:mm:ss:SSSZ");
        var now = moment();
        var diff = moment.duration(then.diff(now));
        if (diff < 0) {
            diff = Math.abs(diff);
        }

        callback({time_diff : moment.utc(diff).format("HH:mm:ss")});
    },

    /*
    * Add tbl_notification
    */
    add_notification : function ( req,callback ) {
        var query = con.query('INSERT INTO tbl_notification SET ?', req, function (error, results, fields) {
            if (error) {
                callback(null, error.sqlMessage)
            }else{
                callback(results.insertId);
            }
        });
    },

    /*
    * Update tbl_notification
    */
    update_to_read_notification : function ( id, callback ) {
        con.query("UPDATE tbl_notification SET ? WHERE id = '"+id+"'", {status: 'Read'}, function (error, result, fields) {
            if (error) {
                callback(null, error.sqlMessage);
            }else{
                callback(result.affectedRows);
            }
        });
    },

    /*
    * Get tbl_settings
    */
    get_settings : function (attribute_name, callback) {
        con.query("SELECT * FROM tbl_settings WHERE meta_key = '"+attribute_name+"'", function (error, result) {
            if (error) {
                callback(null, error.sqlMessage)
            }
            else
            {
                callback(result[0]);
            }
        });
    },

    get_parks_list : function(callback) {
        con.query("SELECT id,name FROM tbl_park_trail WHERE status='Active'", function(err, result) {
            return result;
        });
    },

    /*
    * Get tbl_settings
    */
    get_all_settings : function (callback) {
        con.query("SELECT meta_key, meta_value FROM tbl_settings", function (error, result) {
            if (error) {
                callback(null, error.sqlMessage)
            }
            else
            {
                if(result.length > 0)
                {
                    var setting_data = {};
                    var row = 0;
                    asyncLoop(result, function (item, next)
                    { 
                        setting_data[item.meta_key] = item.meta_value;
                        row++;
                        next();
                    }, function ()
                    {
                        callback(setting_data);
                    });
                }
                else
                    callback(result);
            }
        });
    },

    /*
    ** Function to send email
    */
    send_email: function(subject,to_email,message,callback){
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: globals.email_id, // generated ethereal user
                pass: globals.email_pass // generated ethereal password
            }
        });
    
        // setup email data with unicode symbols
        var mailOptions = {
            from: globals.from_email, // sender address
            to: to_email, // list of receivers 'sonalih@hyperlinkinfosystem.net.in'
            subject: subject, // Subject line
            html: message
        };
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return error;
            }
            //console.log(info)
            callback(true);
        });
    },

    /*
    ** Remove amenities after every 2 hours
    */
    remove_amenities : function(callback) {
        var datetime = require('node-datetime');
        var dt = datetime.create();
        var date = dt.format('Y-m-d H:M:S');
        con.query("SELECT a.id as amenities_id,a.park_trail_id,a.user_id,a.start_trail_id,a.status, TIMESTAMPDIFF(HOUR,DATE_FORMAT(a.insertdate,'%Y-%c-%e %h:%i:%s'), '"+date+"') AS datediff  FROM tbl_park_trail as p JOIN tbl_park_trails_amenities as a ON a.park_trail_id = p.id WHERE a.user_id != '0' AND a.start_trail_id != '0' AND a.status='Active'  having datediff >= '"+globals.min_hours+"' ",  function(err, result){
            if (!err) {
                if (result.length > 0) {
                    var remove_amenities = [];
                    var row = 0;      
                    asyncLoop(result, function (item, next)
                    {
                        if (item.datediff >= 2) {
                            con.query("UPDATE tbl_park_trails_amenities SET updatetime="+date+" AND status = 'DELETED' WHERE id= '"+item.amenities_id+"' AND status = 'Active'");
                        }
                    }, function ()
                    {
                        callback(true);   
                    });
                } else {
                    callback(null);
                }
            } else {
                callback(null)
            }
        });
    }, 

    /*
    * get distance using the google matrix
    */
    get_google_matrix : function(source_data,callback) {
        var distance = require('google-distance');
        distance.apiKey = globals.google_api_key;
        distance.get(
        {
          index: 1,
          origin: ''+source_data.pickup_latitude+','+source_data.pickup_longitude+'',
          destination: ''+source_data.dropoff_latitude+','+source_data.dropoff_longitude+''
        },
        function(err, data) {
            if (err)
                callback(null)
            else
                callback(data);
        });
    },

    /*
    * get notification badge counts
    */
    get_badge_counts(user_id, receiver_type, callback){
        con.query("SELECT COUNT(receiver_id) as counts FROM tbl_notification WHERE receiver_id = ? AND receiver_type = ? AND is_read = ?", [user_id, receiver_type,'Unread'], function (error, result) {
            if (error) {
                callback(0)
            }
            else
            {
                var badge = result[0]['counts'] + 1;
                callback(badge);
            }
        });
    },

    /*
    * Prepare data for push notification
    */
    prepare_notification: function (data) {
        var topic = globals.customer_bundle_id
        var sql = "SELECT ud.device_token,ud.device_type FROM tbl_user_device ud  WHERE ud.device_token!='' AND ud.user_id='"+data.receiver_id+"' "
        con.query(sql,function (err, result) {
            var msg = t(data.msg, {field: data.name })
            if (!err && result[0] != undefined && result[0].device_token != 0) {
                const localizify = require('localizify')
                localizify.setLocale((result[0].language != '') ? result[0].language : 'en');
                //Send push notification
                var push_message = {
                    title: globals.app_name, 
                    message: msg,
                    action_id: data.action_id,
                    sender_id: data.sender_id,
                    receiver_id: data.receiver_id,
                    tag: data.tag
                }
                const push_data = {
                    topic : topic,
                    alert: {
                        title: globals.app_name,
                        body: msg
                    },
                    custom: { 
                        title: globals.app_name,
                        body: msg,
                        message: push_message,
                        action_id: data.action_id,
                        tag: data.tag
                    },
                };
                if(result[0].device_type == "I"){
                    push_data['sound'] = "default"
                }
                Validate.send_push(result[0].device_token, push_data);
            }
            //insert data in notification list table
            if(data.add_notification != undefined && data.add_notification == 1){
                con.query("DELETE FROM tbl_notification WHERE action_id='"+data.action_id+"' AND receiver_id='"+data.receiver_id+"'", function (err, result) {  
                    if(!err) {
                        Validate.insert_notification({
                            sender_id : data.sender_id,
                            sender_type : data.sender_type,
                            receiver_id: data.receiver_id,
                            action_id: data.action_id,
                            message: msg,
                            tag: data.tag,
                            status : data.status
                        })
                    } else {
                        console.log(err.sqlMessage);
                    }
                });
            } else {
                // con.query("DELETE FROM tbl_notification WHERE ?", {action_id : data.action_id}, function (err, result) {  });
            }
        });
    },
        
    /*
    * insert into notification table
    */
    insert_notification: function (data, callback) {
        //find individual query
        con.query("INSERT INTO tbl_notification SET ?", data, function (err, result) { });
    },

    /*
    * Send GCM push notification
    */
    send_push: function(registrationIds,data){
        const settings = {
            gcm: {
                id: globals.gcm,
            },
            apn: {
                token: {
                    key: globals.p8_name, // optionally: fs.readFileSync('./certs/key.p8')
                    keyId: globals.key_id,
                    teamId: globals.team_id,
                },
                production: false
            }
        }; 
        const PushNotifications = require('node-pushnotifications');
        const push = new PushNotifications(settings);
        // console.log(push); return false;
        push.send(registrationIds, data, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    },
}

module.exports = Validate;
