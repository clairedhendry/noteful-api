const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const FoldersRouter = express.Router()
const jsonParser = express.json()

FoldersRouter 
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders()
    })


module.exports = FoldersRouter