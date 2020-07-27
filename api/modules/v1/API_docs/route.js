var express   = require('express');
var path      = require('path');
var globals   = require('../../../config/constants');
var con       = require('../../../config/database');

const { t } = require('localizify');
app = express();
var router = express.Router();
//set the template engine ejs
app.set('view engine', 'ejs')

router.get('/api_docs', (req, res) => {
  //res.render(path.join(__dirname+'/view/new_api_doc.ejs'), { globals: globals })
  res.render(path.join(__dirname+'/view/new_api_doc.ejs'), { globals: globals })
})

// This is the first page to get all the park and trails
router.get('/', (req, res) => {
  // get all parks in the app 
  con.query("SELECT id,name FROM tbl_park_trail WHERE status = 'Active'", function(err, rooms) {
    res.render(path.join(__dirname+'/view/index.ejs'), { globals: globals, rooms : rooms })
  });
})

router.post('/room', (req, res) => {
  con.query("SELECT * FROM tbl_user WHERE id= '"+req.body.user_id+"'", function(err, user_result){
    if(user_result.length > 0) {
      con.query("SELECT c.*, u.id as user_id, u.name as user_name FROM tbl_chat as c JOIN tbl_user as u ON c.user_id=u.id WHERE room_id='"+req.body.room_id+"'", function(err, room_chats) {
        res.render(path.join(__dirname+'/view/room.ejs'), { globals: globals, user_id:req.body.user_id,room_id:req.body.room_id,room_chats : room_chats })
      });
    } else {
      return res.redirect('/api/v1/viewdocs/');
    }
  });
})

router.get('/code', (req, res) => {
  res.render(path.join(__dirname+'/view/reference_code.ejs'), { globals: globals })
})

router.get('/user_list', (req, res) => {
  customer_model.api_user_list(function(response){
    res.render(path.join(__dirname+'/view/user_list.ejs'), { data: response })
  })
})
module.exports = router;