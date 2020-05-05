const FoldersService = {
    getAllFolders(knex) {
        return knex
            .select('*')
            .from('noteful_folders')
    },

    getFolderById() {
        console.log('folder retrieved')
    },

    postFolder() {
        console.log('new folder created')
    },

    updateFolder() {
        console.log('folder updated')
    },

    deleteFolder() {
        console.log('folder deleted')
    }
}

module.exports = FoldersService