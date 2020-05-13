const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const NotesRouter = express.Router()
const jsonParser = express.json()

NotesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(
            req.app.get('db')
        )
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { folder_id, name, content, date_modified } = req.body
        const newNote = { folder_id, name }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
              return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
              })
            }
          }
        
          newNote.content = content
          newNote.date_modified = new Date()

        NotesService.postNote(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${note.id}`))
                .json(note)
        })
        .catch(next)
    })

NotesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getNoteById(
            req.app.get('db'),
            req.params.note_id
        )
        .then(note => {
            if(!note) {
                return res.status(404).json({
                    error: {message: `Note doesn't exist`}
                })
            }
            res.note = note
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.note)
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { folder_id, name, content, date_modified } = req.body
        const newNote = { folder_id, name, content }

        // const numberOfValues = Object.values(newNote).filter(Boolean).length
        // if (numberOfValues === 0)
        //   return res.status(400).json({
        //     error: {
        //       message: `Request body must contain either 'folder_id', 'name', and 'content'`
        //     }
        //   })

        newNote.date_modified = new Date()

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            newNote
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })


module.exports = NotesRouter