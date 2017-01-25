
exports.up = function(knex, Promise) {
	return knex.schema.createTable('officers', function(table) {
		table.increments('id');
		table.string('user_id');
		table.string('role_id');
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('officers');
};
