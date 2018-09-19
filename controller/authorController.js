var Author = require('../models/author');
var Book = require('../models/book');
var asyy = require('Async');
const {body,validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    
	author:Author.find().sort([['family_name', 'ascending']]).exec(
		function(err,result) {
			if(err) return next(err);
			res.render('author_list',{title:'Author List',author_list:result});
		}
	)
	
	
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res,next) {
    
	asyy.parallel({
			author:function(ccc) {Author.findById(req.params.id).exec(ccc);}
			,
			authorbook:function(ccc) {Book.find({'author':req.params.id}).populate('genre').exec(ccc);}
		}	
		,
		function(err,resultObject) {
			if(err) return next(err);
			res.render('author_detail',{title:'Author Detail',author:resultObject.author,authorbook:resultObject.authorbook});
		}
	);
};

// Display Author create form on GET.
exports.author_create_get = function(req, res,next) {
    
	res.render('author_creation_form',{title:'Author Creation'});
};

// Handle Author create on POST.
exports.author_create_post = [
	body('firstname').isLength({min:1}).trim().withMessage('First name must be specified')
	.isAlphanumeric().withMessage('First name has non-alphanumeric characters.')
	,
	body('secondname').isLength({min:1}).trim().withMessage('Seconde name must be specified')
	.isAlphanumeric().withMessage('Second name has non-alphanumeric characters.')
	,
	sanitizeBody('firstname').trim().escape(),
	sanitizeBody('secondname').trim().escape(),
	function(request,response,nextfunction) {
		var nAuthor = new Author({
			first_name:request.body.firstname,
			family_name:request.body.secondname,
			date_of_birth:request.body.datebirth,
			date_of_death:request.body.datedeath
		});
		
		var vrr = validationResult(request);
		
		// validation fail
		if(!vrr.isEmpty()) {
			response.render('author_creation_form',{title:'Author Creation',prevData:request.body,errors:vrr.array()});
			return;
		}
		
		// validation pass
		console.log('author find key : '+ nAuthor.name);		
		console.log('author find key : '+ nAuthor.first_name);		
		console.log('author find key : '+ nAuthor.family_name);		
		Author.findOne({'first_name':nAuthor.first_name,'family_name':nAuthor.family_name}).exec(function(authorfindError,authorfindResult){
			if (authorfindError) return nextfunction(authorfindError);
			console.log('author find result : '+ authorfindResult);		
			if(authorfindResult){
				// find existing name
				response.redirect(authorfindResult.url);
			}
			else{
				nAuthor.save(function(saveerror){
					if(saveerror) return nextfunction(saveerror);
					response.redirect(nAuthor.url);
			});}
				
		});
	}
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author delete GET');
	asyy.parallel({
			author:function(ccc) {Author.findById(req.params.id).exec(ccc);}
			,
			authorbook:function(ccc) {Book.find({'author':req.params.id}).populate('genre').exec(ccc);}
		}	
		,
		function(err,resultObject) {
			if(err) return next(err);
			if(resultObject.authorbook.length != 0) {
				res.render('author_detail_delete',{title:'Author Detail, This author can not be deleted until all book datas of the author deleted',deletable:false,author:resultObject.author,authorbook:resultObject.authorbook});
			}
			else {
			}
			res.render('author_detail_delete',{title:'Author Detail',deletable:true,author:resultObject.author,authorbook:resultObject.authorbook});
		}
	);
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author delete POST');
	Author.findByIdAndRemove(req.body.authorId,function(err){
		if (err) return next(err);
		res.redirect('/catalog/authors');
	})
	
};

// Display Author update form on GET.
exports.author_update_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author update GET');
	Author.findById(req.params.id).exec(xxx);
	
	function xxx(err,result) {
		if(err) return next(err);
		res.render('author_update_form',{title:'Author Update',author:result});
	}
};

// Handle Author update on POST.
exports.author_update_post = [
	body('firstname').isLength({min:1}).trim().withMessage('firstname needed'),
	body('secondname').isLength({min:1}).trim().withMessage('familyname needed'),
	sanitizeBody('*').trim().escape(),
	
	function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author update POST');
		var valtemp = validationResult(req);
		var valMap = valtemp.mapped();
		var valArray = Object.keys(valMap);
		if(!valtemp.isEmpty()) {
			Author.findById(req.params.id).exec(cfn);
			
			function cfn(err,recordList) {
				if(err) return next(err);
				var temp = {
							_id:req.params.id,
							first_name:req.body.firstname,
							family_name:req.body.secondname,
							date_of_birth:req.body.datebirth,
							date_of_death:req.body.datedeath,
							date_of_birth_formatted_2:req.body.datebirth,
							date_of_death_formatted_2:req.body.datedeath
				}
				console.log('valArray : '+valArray);
				console.log(valArray.indexOf('secondname'));
				if(valArray.indexOf('firstname') != -1) {temp.first_name = recordList.first_name;console.log('first match'+temp.first_name+' : '+recordList.first_name);}
				if(valArray.indexOf('secondname') != -1) {temp.family_name = recordList.family_name;console.log('second match'+temp.family_name+' : '+recordList.family_name);}
				console.log('haha temp hahahah: '+JSON.stringify(temp));
				res.render('author_update_form',{title:'Author Update (Re)',
												author:temp,
												errors:validationResult(req).array()
												});
				
			}
			return;
		}
		
		var updateObj = {
					first_name:req.body.firstname,
					family_name:req.body.secondname,
					date_of_birth:req.body.datebirth,
					date_of_death:req.body.datedeath};
		Author.findOneAndUpdate({_id:req.params.id},updateObj,{},cbfn);
		
		function cbfn(err,record) {
			if(err) return next(err);
			res.redirect('/catalog/author/'+req.params.id);
		}
	}
	
];
	

/*
callback consists of 3 parts. 1st calling part, 2nd be called part, 3rd final callback part
node middleware flow is a seires of callbacks. making chain of multiple middleware functions
first when it run a middleware function, we probably pass 'next' function as argument. this
is the callback fucntion. and within the middleware function when it finished or need to
be call next function, it also calls 'next' function with its own 'next' function as argument. this is also a callback function
it makes daisy chain, where everymiddle 'next' function is 'callback function' and same time 'calling function' 
 */