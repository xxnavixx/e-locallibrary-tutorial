var Book = require('../models/book');
var Author = require('../models/author');
var Bookinstance = require('../models/bookinstance');
var Genre = require('../models/genre');

var asyy = require('async');

const {body,validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

exports.index = function(req, res) {
	asyy.parallel(
		{
			book_count:function(cb) {
				Book.countDocuments({},cb);
			},
			book_instance_count:function(cb) {
				Bookinstance.countDocuments({},cb);
			},
			book_instance_available_count:function(cb) {
				Bookinstance.countDocuments({status:'Available'},cb);
			},
			author_count:function(cb) {
				Author.countDocuments({},cb);
			},
			genre_count:function(cb) {
				Genre.countDocuments({},cb);
			},
		}
		,function(err,objResult) {
			res.render('index',{title:'Local Library Home',error:err, data:objResult});
		}
	);
	    
    // asyy.parallel({
        // book_count: function(callback) {
            // Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        // },
        // book_instance_count: function(callback) {
            // Bookinstance.countDocuments({}, callback);
        // },
        // book_instance_available_count: function(callback) {
            // Bookinstance.countDocuments({status:'Available'}, callback);
        // },
        // author_count: function(callback) {
            // Author.countDocuments({}, callback);
        // },
        // genre_count: function(callback) {
            // Genre.countDocuments({}, callback);
        // },
    // }, function(err, results) {
        // res.render('index', { title: 'Local Library Home', error: err, data: results });
    // });
	
    // res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all books.
exports.book_list = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: Book list');
	
	Book.find({},'title author').populate('author').exec(function(err,list_books){
		if(err) {console.log('book list error');return next(err);}
		res.render('book_list',{title:'Book List',book_list: list_books});
	});
};

// Display detail page for a specific book.
exports.book_detail = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
	// Book.findById(req.params.id).populate('author').populate('genre').exec(
		// function(err,result) {
			// if (err) return next(err);
			// res.render('book_detail',{title:'Book Detail',book_detail:result});
		// }
	// )
	
	asyy.parallel(
		{
			book:function (cc) {
				Book.findById(req.params.id).populate('author').populate('genre').exec(cc);
			}
				,
			book_instance:function(cc) {
				Bookinstance.find({'book':req.params.id}).exec(cc);
			}
		}
		,
		function(err,result) {
			 if (err) return next(err);
			 res.render('book_detail',{title:'Book Detail',book:result.book, book_instances:result.book_instance});
		 }
	);
};
/*
 callback function does not need to be async unless it has hard-native coded with wakeup, interrupt mechanism.
 because even if u call a function with callback argument, anyway it will not execute next lines after this call until the function call end.
*/
// Display book create form on GET.
exports.book_create_get = function(req, res, nextFunction) {
    // res.send('NOT IMPLEMENTED: Book create GET');
	asyy.parallel({
			authorList:function(ccc) {
				Author.find().exec(ccc)
			},
			genreList: function(ccc) {
				Genre.find().exec(ccc)
			}
		}
		,
		function(err,resultObject) {
			if (err) return nextFunction(err);
				res.render('book_creation_form',{title:'Book Creation',authorList:resultObject.authorList,genreList:resultObject.genreList});
		}
	)
};

// Handle book create on POST.
exports.book_create_post_BACKUP = [
	function(req, res, next) {
		console.log('raw body genre : '+req.body.bookgenre);
		console.log('raw body genre type: '+ (typeof req.body.bookgenre));
		console.log('raw body genre instanceof Array? :'+(req.body.bookgenre instanceof Array));
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
		console.log('will it proceed to next?');
    },

	body('booktitle').isLength({min:1}).withMessage('at least 1 character of book title').trim(),
	body('booksummary').isLength({min:1}).withMessage('at least 1 summary').trim(),
	body('bookisbn').isLength({min:1}).withMessage('need isbn').trim(),
	sanitizeBody('booktitle').trim().escape(),
	sanitizeBody('booksummary').trim().escape(),
	sanitizeBody('bookisbn').trim().escape(),
	function(req,res,ccc) {
		console.log('---which means here---')
		console.log('typeof? : '+(typeof req.body.bookgenre));
		console.log('instance String? : '+(req.body.bookgenre instanceof String));
		console.log('instance Array? : '+(req.body.bookgenre instanceof Array));
		console.log('---------- genre -------------- value : ' +req.body.bookgenre+'  ------');
		var agObj;
		asyy.parallel({
			authorList:function(ccc) {
				Author.find().exec(ccc)
			},
			genreList: function(ccc) {
				Genre.find().exec(ccc)
			}
			}
		,
			function(err,resultObject) {
				if (err) return nextFunction(err);
			// res.render('book_creation_form',{title:'Book Creation',authorList:resultObject.authorList,genreList:resultObject.genreList});
			
				agObj = resultObject;
				// console.log('agObj :'+agObj);
				var vrr = validationResult(req);
											
				if (!vrr.isEmpty()) {
				// console.log('agObj var :'+agObj+' aList: '+agObj.authorList+' gList : '+agObj.genreList);
					res.render('book_creation_form',{title:'Book Creation (retry)',
					authorList:agObj.authorList,
					genreList:agObj.genreList,
					book:req.body,
					errors:vrr.array()});
					return;
				}
				var nbook = new Book({
						title:req.body.booktitle,
						author:req.body.bookauthor,
						summary:req.body.booksummary,
						isbn:req.body.bookisbn,
						genre:req.body.bookgenre
						});
								
				nbook.save(function(err){
					if(err) return ccc(err);
					res.redirect(nbook.url);
				})
			
			}
		)
		
		
	}		
	
]

exports.book_create_post=[
	function(rq,rs,nn) {
		if(rq.body.bookgenre instanceof Array) {
			console.log('genre is Array type OK');
		}
		else
		{
			console.log('we go Genre as not of array type');
			if(rq.body.bookgenre === undefined) {
				console.log('made empty [] from undefinded');
				rq.body.bookgenre = [];
			}else{
				rq.body.bookgenre = new Array();
				console.log('converted to [] from single value');
			}
			
		}
		nn();
	},

	body('booktitle').isLength({min:1}).trim().withMessage('book title needed'),
	body('bookauthor').isLength({min:1}).trim().withMessage('book author needed'),
	body('booksummary').isLength({min:1}).trim().withMessage('book summary needed'),
	body('bookisbn').isLength({min:1}).trim().withMessage('book isbn needed'),
	
	sanitizeBody('*').trim().escape(),
	
	function(rq,rs,next){
		console.log('in last funtion');
		if(!validationResult(rq).isEmpty()) {
			asyy.parallel(
				{
					authorList:function(ccc){
						Author.find().exec(ccc);
					}
					,
					genreList:function(ccc) {
						Genre.find().exec(ccc);
					}
				}
				,
				function(err,result){
					if(err) return next(err);
					rs.render('book_creation_form',{title:'book creation (Retry)',
													book:rq.body,
													authorList:result.authorList,
													genreList:result.genreList,
													errors:validationResult(rq).array()});
					
				}
			)
			return;
		}
		
		var nbook = new Book({
						title:rq.body.booktitle,
						author:rq.body.bookauthor,
						summary:rq.body.booksummary,
						isbn:rq.body.bookisbn,
						genre:rq.body.bookgenre
						});
		nbook.save(function(err){
			if(err) return next(err);
			rs.redirect(nbook.url);
		});
		
	}
	
]


// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Book delete GET');
	asyy.parallel(
		{
			a:function(hehe){
				Bookinstance.find({book:req.params.id}).exec(hehe);
			}
			,
			b:function(haha){
				Book.findById(req.params.id).populate('author').populate('genre').exec(haha);
			}
		}
	,
		function(err,obj){
			if(err) {next(err);return;}
			// a:bookinstance b:book
			// console.log('b true? : '+Boolean(obj.b));
			// console.log('a length : '+obj.a.length);
			
			if((obj.b) && (obj.a.length==0)) { // find result becomes array, so length property exist. findOne,findById becomes object so length property is undefined
				res.render('book_detail_delete',{title:'Book Deletion positive',book:obj.b,book_instances:obj.a,deletable:true})
			} else if((obj.b) && (obj.a.length!=0)){
				// console.log(' a : '+obj.a+' b : '+obj.b);
				res.render('book_detail_delete',{title:'Book Deletion negative',book:obj.b,book_instances:obj.a,deletable:false})
			} else {
				res.redirect('/catalog/books');
			}
		}
	);
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Book delete POST');
	// got req.body.bookId
	Book.findById(req.body.bookId).exec(aha);
	
	function aha(err,book_doc) {
		if(err){next(err);return;}
		if(book_doc) {
			Book.findByIdAndRemove(req.body.bookId).exec(aha2);
		} else {
			aha2(null);
		}
	}
	
	function aha2(err) 	{
		
		if(err) {next(err);return;}
		console.log('aha2 before res');
		res.redirect('/catalog/books');
	}
};

// Display book update form on GET.
exports.book_update_get = function(req, res,next) {
    // res.send('NOT IMPLEMENTED: Book update GET');
	// retrieve book record and related author genre
	console.log('update get');
	asyy.parallel(
		{a:tempA,b:tempB,c:tempC}
		,
		tempD
	);
	console.log('update get finished');
	function tempA(countingfn){
		Book.findById(req.params.id).populate('genre').exec(countingfn);
	}
	function tempB(countingfn) {
		Author.find().exec(countingfn);
	}
	
	function tempC(countingfn) {
		Genre.find().exec(countingfn);
	}
	
	function tempD(err,obj) {
		if (err) {next(err);return;}
		// obj.a : book        obj.b : author      obj.c:genre
		res.render('book_update_form',{book:obj.a,authorList:obj.b,genreList:obj.c,title:'Book Update form'});
		console.log('tempD render finished');
	}
	
};

// Handle book update on POST.
exports.book_update_post = [
    // res.send('NOT IMPLEMENTED: Book update POST');
		body('booktitle').isLength({min:1}).withMessage('need title').trim(),
		body('bookauthor').isLength({min:1}).withMessage('need author').trim(),
		body('booksummary').isLength({min:1}).withMessage('need summary').trim(),
		body('bookisbn').isLength({min:1}).withMessage('need isbn').trim(),
		// body('genre').isLength({min:1}).withMessage('need genre').trim(),
		
		sanitizeBody('booktitle').trim().escape(),
		sanitizeBody('bookauthor').trim().escape(),
		sanitizeBody('booksummary').trim().escape(),
		sanitizeBody('bookisbn').trim().escape(),
		sanitizeBody('bookgenre.*').trim().escape(),
		
		function(rq,rs,nxx) {
			
			if(!validationResult(rq).isEmpty()) {
				
				console.log('update form has not sufficient information');
				
				asyy.parallel(
						{a:tempA,b:tempB,c:tempC}
						,
						tempD
				);
				// console.log('update get finished');
				function tempA(countingfn){
					Book.findById(rq.params.id).populate('genre').exec(countingfn);
				}
				function tempB(countingfn) {
					Author.find().exec(countingfn);
				}
				
				function tempC(countingfn) {
					Genre.find().exec(countingfn);
				}
				
				function tempD(err,obj) {
					if (err) {next(err);return;}
					// obj.a : book        obj.b : author      obj.c:genre
					rs.render('book_update_form',{book:obj.a,authorList:obj.b,genreList:obj.c,title:'Book Update form',errors:validationResult(rq).array()});
					console.log('post tempD render finished');
					
				}
				return;
			}
			
			var ubook = new Book({
					_id:rq.params.id,
					title:rq.body.booktitle,
					author:rq.body.bookauthor,
					summary:rq.body.booksummary,
					isbn:rq.body.bookisbn,
					genre:rq.body.bookgenre
					
				});
			
			Book.findByIdAndUpdate(rq.params.id, ubook, {}, function (err,thebook) {
				if(err) return nxx(err);
				rs.redirect('/catalog/book/'+rq.params.id);
			});
						
		}
	]	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
