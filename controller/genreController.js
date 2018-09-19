var Genre = require('../models/genre');
var Book = require('../models/book');
var asyncc = require('async');
const {body,validationResult } = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Genre list');
	Genre.find().exec( function (err,result) {
		if(err) return next(err);
		res.render('genre_list',{title:'Genre List',genre_list:result});
	});
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
	asyncc.parallel(
		{
			genre:function(ccc) {
				Genre.findById(req.params.id).exec(ccc);
			}
			,
			genre_books:function(ccc){
				Book.find({'genre':req.params.id}).exec(ccc);
			}
		}
		,
		function(err,result) {
					if(err) return next(err);
					if (result.genre==null) { // No results.
						var err = new Error('Genre not found');
						err.status = 404;
					return next(err);
					}
					res.render('genre_detail',{title:'Genre Description',genre:result.genre, genre_books:result.genre_books});
		}
	);
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    // res.send('NOT IMPLEMENTED: Genre create GET');
	res.render('genre_create_form',{title:'Genre Creation'});
};

// Handle Genre create on POST.
// exports.genre_create_post = function(req, res) {
    // res.send('NOT IMPLEMENTED: Genre create POST');
// };

exports.genre_create_post = [
		body('name', 'Genre name required').isLength({ min: 1 }).trim(),
		sanitizeBody('name').trim().escape(),
		function(req,res,next) {
			const error = validationResult(req);
			
			var genreToCreate = new Genre({name:req.body.name});
			
			if(!error.isEmpty()) {
				res.render('genre_create_form',{title:'Genre Creation',genre:genreToCreate,errors:error.array()});
				// return;
			}
			else {
				Genre.findOne({'name':req.body.name}).exec(function(err,result){
					if(err) return next(err);
					if(result) {
						res.redirect(result.url);
					} 
					else {
						genreToCreate.save(function(err){
							if(err)return next(err);
							res.redirect(genreToCreate.url);
						});
					}
				});
			}
		}
	]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Genre delete GET');
	// find genre
	asyncc.parallel(
		{
			genreDetail:function(ccc) {
				Genre.findById(req.params.id).exec(ccc);
			}
			,
			bookList:function(ccc) {
				Book.find({genre:req.params.id}).exec(ccc);
			}
		},
		function(error,obj) {
			if(error) return next(error);
			if(obj.genreDetail) {console.log('document found');}
			else {console.log('document does not exist');
				res.redirect('catalog/genres');
			}
			if(obj.bookList.length !=0) res.render('genre_detail_delete',{title:'Genre Delete',deletable:false,genre:obj.genreDetail,bookList:obj.bookList});
			else res.render('genre_detail_delete',{title:'Genre Delete',deletable:true,genre:obj.genreDetail,bookList:obj.bookList});
		}
	)
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: Genre delete POST');
	Book.find({genre:req.body.genreId}).exec(function(err,result) {
		if (err) return next(err);
		if(result.length !=0) {
			// console.log('book result : '+result);
			res.redirect('/catalog/genres');
		}
		else {
			// console.log('no books');
			Genre.findByIdAndRemove(req.body.genreId).exec(function(err){
				if(err) return next(err);
				res.redirect('/catalog/genres');
			});
		}
	});
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Genre update GET');
	Genre.findById(req.params.id).exec(tempFn);
	
	function tempFn(err,genre) {
		if(err) return next(err);
		res.render('genre_update',{title:'Genre Update',genre:genre});
	}
};

// Handle Genre update on POST.
exports.genre_update_post = [
	body('name').isLength({min:1}).trim().withMessage('need name'),
	sanitizeBody('name').trim().escape(),
	
	function(req, res, next) {
		// res.send('NOT IMPLEMENTED: Genre update POST');
		var valT = validationResult(req);
		var valArray= Object.keys(valT.mapped());
		var updateContent={};
		console.log('valArray : '+valArray);
		if(!valT.isEmpty()) {
			Genre.findById(req.params.id).exec(function(err,result) {
				if(err) return next(err);
				// console.log('pre---- for : 'valArray.length);
				for(var i=0;i<valArray.length;i++){
					updateContent[valArray[i]] = result[valArray[i]];
				}
				console.log('updateContent : '+updateContent);
				res.render('genre_update',{title:'Genre Update (Re)',genre:updateContent});
			})
			
			return;
		}
		updateContent.name=req.body.name;
		Genre.findOneAndUpdate({_id:req.params.id},updateContent,{},fnA);
		
		function fnA(err,record) {
			if(err) return next(err);
			res.redirect('/catalog/genre/'+req.params.id);
		}
	}
];
