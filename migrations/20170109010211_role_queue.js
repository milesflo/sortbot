
exports.up = function(knex, Promise) {
	return knex.schema.createTable('role_queue', function(table) {
		table.increments('id');
		table.string('user_id');
		table.string('server_id');
		table.string('role_name');
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('role_queue');
};
