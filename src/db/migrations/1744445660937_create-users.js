/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    user_name: { type: 'text', notNull: true },
    role: { type: 'text', notNull: true, default: 'customer' },
    phone_Number: { type: 'text' },
    gender: { type: 'text' },
    kakao_id: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  })
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `)

  pgm.sql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `)
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('users')
}
