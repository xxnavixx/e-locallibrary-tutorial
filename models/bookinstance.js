var mon = require('mongoose');
var momnt = require('moment');

var bookinstanceSchema = mon.Schema(
{
    book: { type: mon.Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
  }
);

bookinstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

bookinstanceSchema.virtual('due_back_formatted').get(
	function() {
		return this.due_back?momnt(this.due_back).format('MMMM Do, YYYY'):' ';
	}
);

bookinstanceSchema.virtual('due_back_formatted_2').get(
	function() {
		return this.due_back?momnt(this.due_back).format('YYYY-MM-DD'):' ';
	}
);



module.exports = mon.model('model_bookinstace',bookinstanceSchema);