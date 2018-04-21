var express = require('express');
var router = express.Router();
var User = require('../models/user');
require('./../util/util');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post("/login", function(req,res,next){
	let param = {
		userName: req.body.userName,
		userPwd: req.body.userPwd
	};
	User.findOne(param, function (err, doc){
		if (err) {
			res.json({
				status:"1",
				msg:err.message,
				result: ""
			});
		}else{
			if(doc){
				res.cookie("userId",doc.userId,{
					path:"/",
					maxAge:1000*3600
				});
				res.cookie("userName", doc.userName,{
					path: "/",
					maxAge: 1000*3600
				});
				res.json({
					status:"0",
					msg:"",
					result:{
						userName:doc.userName
					}
				})
			}else{
				res.json({
					status: '10002',
					msg: '账户密码错误',
					result: ''
				})
			}
		}
	})
});

router.post("/logout", function(req, res, next){
	res.cookie("userId", "", {
		path: "/",
		maxAge: -1
	});
	res.cookie("userName", "",{
		path: "/",
		maxAge: -1
	})
	res.json({
		status: "0",
		msg: '',
		result: ''
	})
});

router.get("/checkLogin", function (req,res,next) {
  if(req.cookies.userId){
      res.json({
        status:'0',
        msg:'',
        result:req.cookies.userName || ''
      });
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});

router.get("/cartList", function(req,res,next){
  let userId = req.cookies.userId;
  User.findOne({userId:userId}, function(err,doc){
  	if(err){
  		res.json({
  		status: '1',
  		msg: err.message,
  		result: ''
  	  });
  	}else{
  		if (doc) {
  			res.json({
  				status: '0',
  				mag: '',
  				result: doc.cartList
  			});
  		}
  	}
  })
});

router.get("/getCartCount", function(req, res, next){
	if (req.cookies && req.cookies.userId) {
		var userId = req.cookies.userId;
		User.findOne({userId:userId}, function(err, doc){
			if (err) {
				res.json({
					status: '1',
					msg: err.message,
					result: ''
				});
			}else{
				let cartList = doc.cartList;
				let cartCount = 0;
				cartList.map(function(item){
					cartCount += parseInt(item.productNum);
				});
				res.json({
					status: '0',
					msg: '',
					result: cartCount
				})
			}
		})
	}
})

router.post("/cartDel", function(req,res,next){
	let userId = req.cookies.userId, productId = req.body.productId;
	User.update({
		userId: userId
	},{
		$pull: {
			'cartList':{
				'productId': productId
			}
		}
	}, function(err, doc){
		if (err) {
			res.json({
				status: '1',
				mag: err.message,
				result: ''
			});
		}else{
			res.json({
				status: '0',
				msg: '',
				result: 'suc'
			});
		}
	})
});

//修改商品数量
router.post("/cartEdit", function(req,res,next){
	let userId = req.cookies.userId, productId = req.body.productId, productNum = req.body.productNum, checked = req.body.checked;
	User.update({"userId": userId, "cartList.productId":productId},{
		"cartList.$.productNum":productNum,
		"cartList.$.checked":checked,
	}, function(err,doc){
		if (err) {
			res.json({
				status: '1',
				mag: err.message,
				result: ''
			});
		}else{
			res.json({
				status: '0',
				msg: '',
				result: 'suc'
			});
		}
	})
});

router.post("/editCheckAll", function(req, res, next){
	let userId = req.cookies.userId,
		checkAll = req.body.checkAll?'1':'0';
	User.findOne({userId}, function(err, user){
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			if (user) {
				user.cartList.forEach((item)=>{
					item.checked = checkAll;
				})
				user.save(function(err1,doc){
					if (err1) {
						res.json({
							status: '1',
							mag: err1.message,
							result: ''
						});
					}else{
						res.json({
							status: '0',
							msg: '',
							result: 'suc'
						});
					}
				})
			}
		}
	})
});

router.get("/addressList", function(req, res, next){
	let userId = req.cookies.userId;
	User.findOne({userId:userId}, function(err, doc){
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			res.json({
				status: '0',
				msg: '',
				result: doc.addressList
			})
		}
	})
});

router.post("/setDefault", function(req, res, next){
	let userId = req.cookies.userId,
		addressId = req.body.addressId;
	if(!addressId){
		res.json({
			status: '1003',
			msg: 'addressId is null',
			result: ''
		});
	}else{
		User.findOne({userId:userId}, function(err,doc){
			if (err) {
				res.json({
					status: '1',
					msg: err.message,
					result: ''
				});
			}else{
				let addressList = doc.addressList;
				addressList.forEach((item)=>{
					if (item.addressId == addressId) {
						item.isDefault = true;
					}else{
						item.isDefault = false;
					}
				});
				doc.save(function(err1,doc1){
					if (err) {
						res.json({
							status: '1',
							msg: err.message,
							result: ''
						});
					}else{
						res.json({
							status: '0',
							mag: '',
							result: ''
						})
					}
				})
			}
		})
	}
});

router.post("/delAddress", function(req, res, next){
	let userId = req.cookie.userId,
		addressId = req.body.addressId;
	User.update({
		userId:userId
	},{
		$pull: {
			'addressList':{
				'addressId': addressId
			}
		}
	}, function(err, doc){
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			res.json({
				status: '1',
				msg: '',
				result: ''
			});
		}
	})
});

router.post("/payment", function(req, res, next){
	let userId = req.cookies.userId,
		orderTotal = req.body.orderTotal,
		addressId = req.body.addressId;
	User.findOne({userId:userId}, function(err, doc){
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			let address = '', goodsList = [];
			doc.addressList.forEach((item)=>{
				if (addressId == item.addressId) {
					address= item;
				}

			});
			doc.cartList.filter((item)=>{
				if (item.checked == '1') {
					goodsList.push(item);

				}
			});

			var platform = '622';
			var r1 = Math.floor(Math.random()*10);
			var r2 = Math.floor(Math.random()*10);

			var sysDate = new Date().Format('yyyymmddhh');
			var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
			var orderId = platform+r1+sysDate+r2;

			var order = {
				orderId: orderId,
				orderTotal: orderTotal,
				addressInfo: address,
				goodsList: goodsList,
				orderStatus: '1',
				createDate: createDate
			};

			doc.orderList.push(order);
			doc.save(function(err1, doc1){
				if (err1) {
					res.json({
						status: '1',
						msg: err.message,
						result: ''
					});
				}else{
					res.json({
						status: "0",
						msg: '',
						result: {
							orderId: order.orderId,
							orderTotal: order.orderTotal
				}
			})
				}
			})
		}
	})
});

router.get("/orderDetail",function(req, res, next){
	var userId = req.cookies.userId,
		orderId = req.param("orderId");
	User.findOne({userId: userId}, function(err, doc){
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			var orderList = doc.orderList;
			if (orderList != 0) {
				var orderTotal = 0;
				orderList.forEach((item)=>{
					if (item.orderId == orderId) {
						orderTotal = item.orderTotal;
					}
				});
				res.json({
					status:'0',
					msg: "",
					result: {
						orderId: orderId,
						orderTotal: orderTotal
					}
				})
			}else{
				res.json({
					status: '1001',
					msg: 'not found orderList',
					result: ''
				})
			}
		}
	})
})

module.exports = router;