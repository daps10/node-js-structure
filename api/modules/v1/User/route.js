var express = require('express');
var controllers = require("./controllers");
var dateFormat = require('dateformat');
app = express();
var router = express.Router(); // get an instance of the express Router

router.use(function(req,res,next){
    console.log(req.url, "@", dateFormat('yyyy-mm-dd HH:MM:ss'));
    next();
});

/* 
** API for signup user
*/
router.post('/signup',  controllers.signup);

/* 
** API for login user
*/
router.post('/login',  controllers.login);

/* 
** API for get users list
*/
router.post('/getAllUser', controllers.getAllUser);

/* 
** API for get user by id
*/
router.post('/getUserById', controllers.getUserById);

/* 
** API for update user
*/
router.post('/updateUser', controllers.updateUser);

/* 
** API for delete user
*/
router.post('/deleteUser', controllers.deleteUser);

/* 
** API for logout user
*/
router.post('/logout', controllers.logout);

module.exports = router;