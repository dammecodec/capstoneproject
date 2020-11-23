var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/user');
const fileType = require('file-type')
var multer = require('multer')
const fs = require('fs');

const multipleUploadController = require("../controllers/multipleUploadController");

// var upload = multer({ dest: 'uploads/' })

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/user/')
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})
var upload = multer({ storage: storage })

// ------------------------------------------------------------GỌI LOCAL HOST----------------------------------------------------------

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    console.log('check session yes');
    return res.redirect('/user');
  } else {
    console.log('check session no');
    return res.redirect('/dangnhap');
  }
}
// GET route for reading data
router.get('/', requiresLogin,  function (req, res, next) {
  return next();
});

// -----------------------------------------ROUTER SỬA INFO-------------------------------------------------------------------------


router.post('/moreinfo/updatee/:idsua', function (req, res, next) {
  User.findOneAndUpdate({id: req.params.idsua}, 
    {$set: {username: req.body.ten,
      comp: req.body.company,
      phong: req.body.room,
      ms: req.body.maso,
      phone: req.body.sdt,
    }}, 
    {upsert: true}, function(err,doc) {
    console.log('check it')
    return res.redirect('/upava/'+ req.params.idsua);
  });  
});

router.post('/updateava/:idsua', upload.single('avatar'), function (req, res, next) {
  User.findOneAndUpdate({_id: req.params.userId}, 
    {$set: {
      img_path: req.file.destination, 
      img_name:req.file.filename,
    }}, 
    {upsert: true}, function(err,doc) {
    console.log('check it')
    return res.redirect('/user');
  });  
});
// ------------------------------------ROUTER UP DỮ LIỆU------------------------------------------------------------------------------


router.post("/multiple-upload/:iduser", multipleUploadController.multipleUpload);


// -----------------------------------------------------XỬ LÝ ĐĂNG NHẬP-------------------------------------------------------------


router.post('/',  function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

// -------------------------------------------------------------ĐĂNG KÝ------------------------------------------------------


  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        User.findOneAndUpdate({_id: req.session.userId}, 
          {$set: {id: req.session.userId,
          }}, 
          {upsert: true}, function(err,doc) {
        });  
        return res.redirect('/moreinfo');
      }
    });
  } 
// ---------------------------------------------------------ĐĂNG NHẬP------------------------------------------------

  else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        res.render('dangnhap',  {title: 'Wrong Password'} )
      } else {
        req.session.userId = user._id;
        return res.redirect('/user');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

//-------------------------------------------- GET for logout logout------------------------------------------------------
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});



// --------------------------------------------------------WHITE LIST-----------------------------------------------------------------



router.get('/whitelist',  function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'userinfo';
  const findDocuments = function(db, callback) {
    const collection = db.collection('users');
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db = client.db(dbName);
      findDocuments(db, function(dulieu) {
        res.render('whitelist', {title: 'White list', data : dulieu, sess: req.session.userId});
        client.close();
      });
  });
});

router.get('/whitelist/:idwhitexoa', function(req, res, next) {
  User.findOneAndUpdate({id: req.params.idwhitexoa}, 
    {$set: {white: '0',
    }}, 
    {upsert: true}, function(err,doc) {
    console.log('change white');
    return res.redirect('/whitelist');
  });  
 });
 
 
// --------------------------------------------------------DANH SÁCH NGƯỜI DÙNG-----------------------------------------------------------------


router.get('/listuser',  function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'userinfo';
  const findDocuments = function(db, callback) {
    const collection = db.collection('users');
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db = client.db(dbName);
      findDocuments(db, function(dulieu) {
        res.render('listuser', {title: 'User List', data : dulieu, sess: req.session.userId});
        client.close();
      });
  });
});



// -------------------------------------------------------- XỬ LÝ VỚI WHITE LIST-----------------------------------------------------------------


router.get('/addwhitelist',  function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'userinfo';
  const findDocuments = function(db, callback) {
    const collection = db.collection('users');
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db = client.db(dbName);
      findDocuments(db, function(dulieu) {
        res.render('addwhitelist', {title: 'Thêm white list', data : dulieu, sess: req.session.userId});
        client.close();
      });
  });
});



router.get('/addwhitelist/:idwhite', function(req, res, next) {
  console.log('check it down');
  User.findOneAndUpdate({id: req.params.idwhite}, 
    {$set: {white: '1',
    }}, 
    {upsert: true}, function(err,doc) {
    console.log('change white')
    return res.redirect('/addwhitelist');
  }); 
}); 



// --------------------------------------------------------TRANG CHỦ-----------------------------------------------------------------

router.get('/user',  function (req, res, next) {
  const directoryPath = `${__dirname}/../dataface/${req.session.userId}`;
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
    });

  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('indexuser',{title: 'Trang người dùng', data2 : dulieu2, face:files});
        client.close();
      });
  });
});

});


// --------------------------------------------------------ROUTER ĐĂNG NHẬP-----------------------------------------------------------------

router.get('/dangnhap', function (req, res, next) {
res.render('dangnhap',{title: 'Trang đăng nhập'});
});
router.get('/dangky', function (req, res, next) {
  res.render('dangky',{title: 'Trang đăng ký'});
});



// --------------------------------------------------------SỬA INFO-----------------------------------------------------------------

router.get('/moreinfo/:idsua', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  const findDocuments2 = function(db3, callback) {
    const collection = db3.collection('users');
    collection.find({ 'id' : req.params.idsua}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
    const db3 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
      findDocuments2(db3, function(dulieu3) { 
        res.render('moreinfo',{title: 'Thêm thông tin', data2 : dulieu2, data3: dulieu3});
        client.close();
        client.close();
      });
  });  
  });
});



 
// --------------------------------------------------------SỬA AVA-----------------------------------------------------------------

router.get('/upava/:idsua', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.params.idsua}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('upava',{title: 'Cập nhật ảnh đại diện', data2 : dulieu2});
        client.close();
      });
  });
});




// --------------------------------------------------------NHẬP DATA-----------------------------------------------------------------

router.get('/inpdata', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('inpdata',{title: 'Trang nhập dữ liệu', data2 : dulieu2, message:''});
        client.close();
      });
  });
});    

router.get('/inpdata/:mess', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  if (req.params.mess == 'success'){
    message = 'You has been uploaded !';
  }
  else if (req.params.mess == 'length'){
    message = 'You must select at least 1 file or more.';
  }
  else if (req.params.mess == 'limit'){
    message = 'Exceeds the number of files allowed to upload. The maximum file is 20';
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('inpdata',{title: 'Trang nhập dữ liệu', data2 : dulieu2, message: message});
        client.close();
      });
  });
});  




// --------------------------------------------------------UNKNOWN-----------------------------------------------------------------

router.get('/unknown', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('unknown',{title: 'Người chưa định danh', data2 : dulieu2});
        client.close();
      });
  });
});





// --------------------------------------------------------CAMERA-----------------------------------------------------------------

router.get('/camera', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('camera',{title: 'Theo dõi trực tuyến', data2 : dulieu2});
        client.close();
      });
  });
});




// --------------------------------------------------------HISTORY-----------------------------------------------------------------

router.get('/history', function (req, res, next) {
  const MongoClient = require('mongodb').MongoClient;
  const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName2 = 'userinfo';
  const findDocuments = function(db2, callback) {
    const collection = db2.collection('users');
    collection.find({ 'id' : req.session.userId}).toArray(function(err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);   
    const db2 = client.db(dbName2);
      findDocuments(db2, function(dulieu2) {
        res.render('history',{title: 'Lịch sử', data2 : dulieu2});
        client.close();
      });
  });
});

 
   

module.exports = router;