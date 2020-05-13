const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { foldersData, notesData } = require('./test-data.fixtures')

describe(`Noteful endpoints`, () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

describe(`/api/folders`, () => {

    describe(`GET /api/folders`, () => {
      context(`Given there are no folders in the database`, () => {
        it('responds with 200 and an empty []', () => {
          return supertest(app)
            .get('/api/folders')
            .expect(200, [])
        })
      })
     
      context(`Given there are folders in the database`, () => {
        const testFolders = foldersData;
        beforeEach('insert folders', () => {
          return db 
            .into('noteful_folders')
            .insert(testFolders)
            })
        
            it('responds with 200 and all the folders', () => {
              return supertest(app)
                .get('/api/folders')
                .expect(200, testFolders)
            })
            
        })
      })

      describe(`POST /api/folders`, () => {
        it('responds with 201 and posts new folder', () => {
            const testFolder = {
              name: "test name"
            }
            return supertest(app)
              .post('/api/folders')
              .send(testFolder)
              .expect(201)
              .expect(res => {
                expect(res.body.name).to.eql(testFolder.name)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
              })
              .then(postRes => 
                supertest(app)
                  .get(`/api/folders/${postRes.body.id}`)
                  .expect(postRes.body)
                  )
        })
        it('responds with 400 when missing name in request body', () => {
          const testFolder = {}
          return supertest(app)
            .post('/api/folders')
            .send(testFolder)
            .expect(400, {
              error: { message: `Missing 'name' in request body`}
            })
        })
      })
    })

describe('/api/folders/:folder_id', () => {
    
    describe(`GET /api/folders/:folder_id`, () => {
      context('Given there are folders in the database',() => {
        const testFolders = foldersData;
  
        beforeEach('insert folders', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })
      it('responds with 200 and selected folder', () => {
        const testFolderId = 2
        const expectedFolder = testFolders[testFolderId - 1]
        return supertest(app)
          .get(`/api/folders/${testFolderId}`)
          .expect(200, expectedFolder)
      })
    })

    context('Given there are no folders in the database', () => {
      it('responds with 404', () => {
        const folderId = 56
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, {
            error: {message: `Folder doesn't exist`}
          })
      })
    })
    })


    describe('DELETE /api/folders/:folder_id', () => {
      context('Given there are folders in the database', () => {
        const testFolders = foldersData;
  
        beforeEach('insert folders', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })
      it(`responds with 404 when folder doesn't exist`, () => {
        const testFolderId = 56
        return supertest(app)
          .delete(`/api/folders/${testFolderId}`)
          .expect(404, {
            error: {message: `Folder doesn't exist`}
          })
      })

      it(`responds with 204 and removes folder`, () => {
        const idToRemove = 2
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res => 
              supertest(app)
                .get(`/api/folders`)
                .expect(expectedFolders))
      })

    })
      
    })
  })


describe('/api/notes endpoints', () => {

  describe('GET /api/notes', () => {
    context('Given there are notes in the database', () => {
      const testFolders = foldersData;
      const testNotes = notesData;

      beforeEach('insert folders and notes into database', () => {
        return db
            .into('noteful_folders')
            .insert(testFolders)
            .then(() => {
              return db
              .into('noteful_notes')
              .insert(testNotes)
            })
      })

      it('responds with 200 and all notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200)
          .expect(res => {
            expect(res.body.length).to.eql(testNotes.length)
          })
      })
    })
      
      context('Given there are no notes in the database', () => {
        const testFolders = foldersData;
        beforeEach('insert folders and notes into database', () => {
          return db
              .into('noteful_folders')
              .insert(testFolders)
          })

        it('responds with 200 and empty array', () => {
          return supertest(app)
            .get('/api/notes')
            .expect(200, [])
        })
      })

    
  })

  describe(`/api/notes/:note_id`, () => {

    context('Given there are notes in the database', () => {
      const testFolders = foldersData;
      const testNotes = notesData;

      beforeEach('insert folders and notes into database', () => {
        return db
            .into('noteful_folders')
            .insert(testFolders)
            .then(() => {
              return db
              .into('noteful_notes')
              .insert(testNotes)
            })
      })
    it('GET /api/notes/:note_id returns 200 and correct note', () => {
      const testNoteId = 2
      const expectedNote = testNotes[testNoteId - 1]
      return supertest(app)
        .get(`/api/notes/${testNoteId}`)
        .expect(200, expectedNote)
    })
      
    it('responds with 404 when note does not exist', () => {
      const testNoteId = 56
      return supertest(app)
        .get(`/api/notes/${testNoteId}`)
        .expect(404, {
          error: {message: `Note doesn't exist`}
        })
    })

    it('PATCH /api/note/:note_id updates note', () => {
        const noteToBeUpdated = 2
        const newNoteInfo = {
          "content": "new content"
        }
        const expectedNote = {
          ...testNotes[noteToBeUpdated - 1],
          ...newNoteInfo
        }
        return supertest(app)
          .patch(`/api/notes/${noteToBeUpdated}`)
          .send(newNoteInfo)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/notes/${noteToBeUpdated}`)
              .expect(expectedNote)
          })
    })

    it('responds with 404 when note does not exist', () => {
      const testNoteId = 56

      return supertest(app)
        .patch(`/api/notes/${testNoteId}`)
        .expect(404, {
          error: {message: `Note doesn't exist`}
        })
    })

  it(`DELETE /api/notes/:note_id deletes note`, () => {
    const noteIdToBeDeleted = 4
    const expectedNotes = testNotes.filter(note => note.id !== noteIdToBeDeleted)
    return supertest(app)
      .delete(`/api/notes/${noteIdToBeDeleted}`)
      .expect(204)
      .then(res => {
        supertest(app)
          .get(`/api/notes`)
          .expect(expectedNotes)
      })
  })

  it('responds with 404 when note does not exist', () => {
    const testNoteId = 56
    return supertest(app)
      .delete(`/api/notes/${testNoteId}`)
      .expect(404, {
        error: {message: `Note doesn't exist`}
      })
  })

    })

  context('Given there are no notes in the database', () => {
    const testFolders = foldersData;

    beforeEach('insert folders and notes into database', () => {
      return db
          .into('noteful_folders')
          .insert(testFolders)
    })

    it('GET responds with 200 and empty array', () => {
      return supertest(app)
        .get('/api/notes')
        .expect(200, [])
    })

    it('POST creates new note succesfully', () => {
      const newNote = {
        "name": "New Note",
        "content": "new note content",
        "folder_id": 3
      }

      return supertest(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .then(res => {
          supertest(app)
            .get(`/api/notes/${newNote.id}`)
            .expect(200, newNote)
        })
    })

  })
  })

})

})


