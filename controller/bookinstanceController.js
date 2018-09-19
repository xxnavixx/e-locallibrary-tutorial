var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var asyncA = require('async');
var momentA = require('moment');

const {body,validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, ccc) {
    // res.send('NOT IMPLEMENTED: BookInstance list');
	BookInstance.find().populate('book').exec(
		function(err,b_ins_list) {
			if(err) return ccc(err);
			res.render('bookinstance_list',{title:'Book Instance List',bookinstance_list: b_ins_list});
		}
	);
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
	BookInstance.findById(req.params.id).populate('book').exec(function(err,result){
		if(err) return next(err);
		res.render(
			'bookinstance_detail',{title:'Book Instance Detail',result:result}
		);
	});
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance create GET');
	Book.find().exec(function(err,books){
		if(err) return next(err);
		res.render('bookinstance_creation_form',{title:'Book Instance Creation',bookList:books});
	});
	
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
	body('booktitle').isLength({min:1}).trim().withMessage('need book title'),
	body('imprint').isLength({min:1}).trim().withMessage('need imprint'),
	
	sanitizeBody('imprint').trim().escape(),
	
	function(req,res,next) {
		if(!validationResult(req).isEmpty()) {
			Book.find().exec(function(err,books){
			if(err) return next(err);
				res.render('bookinstance_creation_form',{title:'Book Instance Creation (Retry)',bookList:books,errors:validationResult(req).array()});
			});
			return;
		}
		
		// book validation pass
		var nBookIns = new BookInstance({
										book:req.body.booktitle,
										imprint:req.body.imprint,
										status:req.body.status,
										due_back:req.body.dueback
										});
		BookInstance.find({imprint:req.body.imprint}).exec(function(err,result){
			if(err) return next(err);
			console.log('imprint????');
			// console.log('resultImprint : '+ result[0].imprint+'  newImprint : '+nBookIns.imprint);
			if (result.length!=0 && result[0].imprint == nBookIns.imprint) {
				console.log('same imprint');
				nBookIns.save(function(err) {
					if(err) return next(err);
					res.redirect(nBookIns.url);
				})
			}
			else {
				console.log('new imprint');
				nBookIns.save(function(err) {
					if(err) return next(err);
					res.redirect(nBookIns.url);
				})
				
			}
		});
	}
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance delete GET');
	BookInstance.findById(req.params.id).exec(function(err,one_doc) {
		if(err) {next(err); return;}
		if(one_doc) res.render('bookinstance_detail_delete',{title:'Bookinstance Deletion Confirm',result:one_doc});
		else res.redirect('/catalog/bookinstances');
	});
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance delete POST');
	BookInstance.findByIdAndRemove(req.body.insId).exec(function(err){
		if(err) {next(err);return;}
		res.redirect('/catalog/bookinstances');
	});
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: BookInstance update GET');
	asyncA.parallel({a:tempA,b:tempB},tempD);
	
	function tempA(aa) {
		Book.find().exec(aa);
	}
	
	function tempB(aa) {
		BookInstance.findById(req.params.id).exec(aa);
	}
	
	function tempD(err,obj) {
			
		if(err) return next(err);
		res.render('bookinstance_detail_update_form',{title:'Book Instance Detail Update Form',bookList:obj.a,book_instance:obj.b});
			
	}
	
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
	body('booktitle').isLength({min:1}).trim().withMessage('need book title'),
	body('imprint').isLength({min:1}).trim().withMessage('need imprint'),
	
	sanitizeBody('imprint').trim().escape(),
	
	function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance update POST');
	// got req.body
		if(!validationResult(req).isEmpty()) {
			Book.find().exec(
				function(err,recordList) {
					if(err) return next(err);
					// console.log(recordList);
					var temp = {	
									_id:req.params.id,
									book:req.body.booktitle,
									imprint:req.body.imprint,
									status:req.body.status,
									due_back:req.body.dueback,
									due_back_formatted_2:req.body.dueback
					}
					
					console.log('tempObj.dueback : '+temp.due_back+' f2 : '+temp.due_back_formatted_2);
					res.render('bookinstance_detail_update_form',{title:'Book Instance Detail Update (Re)',
																bookList:recordList,
																book_instance:temp,
																errors:validationResult(req).array()}
					);
				}
			);
			
			return;
		}
		// var uBookInstance = new BookInstance({
								// _id:req.params.id,
								// book:req.body.book,
								// imprint:req.body.imprint,
								// status:req.body.status,
								// due_back:req.body.dueback
							// });
		var uBookInstance = {
								book:req.body.booktitle,
								imprint:req.body.imprint,
								status:req.body.status,
								due_back:req.body.dueback
							};
		BookInstance.findByIdAndUpdate(req.params.id,uBookInstance,{},function(err,record){
			if(err) return next(err);
			res.redirect('/catalog/bookinstance/'+req.params.id);
		});
	}
]




















