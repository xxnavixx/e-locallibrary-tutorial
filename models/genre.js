var mon = require('mongoose');

var schemaGenre = mon.Schema(
{name:{type:String,min:3,max:100,required:true}}
);

schemaGenre.virtual('url').get(function(){
	return '/catalog/genre/'+this._id;	
})

module.exports= mon.model('model_genre',schemaGenre);