'use strict';

let imports = {
    'BaseRepository' : require(__commonPath + '/lib/BaseRepository.class.js')
};

module.exports = class NasdaqKeyRepository extends imports.BaseRepository {

    /**
     * Adds a new data key
     * Updates the key name if it already exists
     *
     * @returns promise
     */
    upsert(key, name) {
        return this.db(this.tableName)
            .insert({
                'key' : key,
                'name' : name
            }).catch(() => {
                return this.db(this.tableName)
                    .where('key', '=', key)
                    .update({
                        name: name,
                    });
            });
    }

    /**
     * Searches for nasdaq keys using a key list filter
     *
     * @returns promise
     */
    findByKey(keyList) {
        return this.db(this.tableName)
            .select(['key', 'name'])
            .where('key', 'in', keyList)
        ;
    }
}