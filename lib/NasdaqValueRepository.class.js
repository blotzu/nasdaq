'use strict';

let imports = {
    'BaseRepository' : require(__commonPath + '/lib/BaseRepository.class.js')
};

module.exports = class NasdaqValueRepository extends imports.BaseRepository {
    /**
     * Adds a new data point
     * Updates the point value if it already exists
     *
     * @returns promise
     */
    upsert(key, timePoint, value) {
        return this.db(this.tableName).insert({
            "key": key,
            'time_point' : timePoint,
            'value' : value
        }).catch(() => {
            return this.db(this.tableName)
                .where('key', '=', key)
                .andWhere('time_point', '=', timePoint)
                .update({
                    value: value,
                });
        });
    }

    /**
     * Searched for nasdaq value data points
     * Arguments:
     *  - filters:
     *      - time_start : integer ( min time_point )
     *      - time_end : integer ( max time_point )
     *  - sort: a key => value sort map
     *      - col => asc|desc
     *
     * @returns promise
     */
    find(filters, sort) {
        let keys = Object.keys(filters);

        let query = this.db(this.tableName)
            .select(['key', 'time_point', 'value']);

        // set the filters
        if ('key' in filters) {
            query.where('key', '=', filters['key']);
        }
        if ('time_start' in filters) {
            query.where('time_point', '>=', filters['time_start']);
        }
        if ('time_end' in filters) {
            query.where('time_point', '<=', filters['time_end']);
        }

        // set the sort
        if (sort) {
            let sortKeys = Object.keys(sort);
            for (let key of sortKeys) {
                query.orderBy(key, sort[key]);
            }
        }

        return query;
    }
}