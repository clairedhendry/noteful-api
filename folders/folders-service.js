const FoldersService = {
    getAllFolders(knex) {
        return knex
            .select('*')
            .from('noteful_folders')
    },

    getFolderById(knex, id) {
        return knex
            .from('noteful_folders')
            .select('*')
            .where('id', id)
            .first()
    },

    postFolder(knex, newFolder) {
        return knex 
            .insert(newFolder)
            .into('noteful_folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    updateFolder(knex, id, newFolderData) {
        return knex('noteful_folders')
            .where({id})
            .update(newFolderData)
    },

    deleteFolder(knex, id) {
        return knex('noteful_folders')
            .where({id})
            .delete()
    },
}

module.exports = FoldersService