
exports.up = function(knex, Promise) {
	return knex.schema.createTable('meta', function(table) {
		table.increments('id');
		table.string('server_id');
		table.string('server_motd');
		table.string('default_role');
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('meta');
};
