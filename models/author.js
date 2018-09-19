var mongoose=require('mongoose');
var temp = mongoose.Schema;
var mnt = require('moment');

var schemaAuthor = new temp({
	first_name:{type:String, required:true ,max:100},
	family_name:{type:String, required:true, max:100},
	date_of_birth:{type: Date},
	date_of_death:{type: Date},
});

schemaAuthor.virtual('name').get(
	function(){
	return this.family_name+', '+this.first_name;
});

schemaAuthor.virtual('url').get(
function(){
		return '/catalog/author/'+this._id;
	}
); 

schemaAuthor.virtual('date_of_birth_formatted').get(
function() {
	return this.date_of_birth?mnt(this.date_of_birth).format('MMMM Do, YYYY') : '-';
}
);

schemaAuthor.virtual('date_of_death_formatted').get(
function() {
	return this.date_of_death?mnt(this.date_of_death).format('MMMM Do, YYYY') : '-';
}
);

schemaAuthor.virtual('date_of_birth_formatted_2').get(
	function() {
		return this.date_of_birth?mnt(this.date_of_birth).format('YYYY-MM-DD') : '-';
	}
)

schemaAuthor.virtual('date_of_death_formatted_2').get(
	function() {
		return this.date_of_death?mnt(this.date_of_death).format('YYYY-MM-DD') : '-';
	}
)

schemaAuthor.virtual('lifespan').get(
function(){
	return ((this.date_of_birth?mnt(this.date_of_birth).format('MMMM Do, YYYY') : ' ')+' ~ '+(this.date_of_death?mnt(this.date_of_death).format('MMMM Do, YYYY') : ' '));
}
)

var modelAuthor = mongoose.model('modelAuthor',schemaAuthor);

module.exports = modelAuthor;

