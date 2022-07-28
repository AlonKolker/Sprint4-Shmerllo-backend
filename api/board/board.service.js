const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query() {
    try {
        // const filterCriteria = _buildFilterCriteria(filterBy)
        // const sortCriteria = _buildSortCriteria(filterBy)
      

        const collection = await dbService.getCollection('board')
        // console.log('collection')
        var boards = await collection.find({}).toArray()
        // console.log('boards',boards);
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = collection.findOne({ _id: ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    console.log('on2')
    try {
        delete board._id
        const collection = await dbService.getCollection('board')
        const addedBoard = await collection.insertOne(board)
        // console.log('addedBoard')
        return addedBoard
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}
async function update(board) {
    try {
        var id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        board._id = id
        return board
    } catch (err) {
        logger.error(`cannot update board ${boardId}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}

function _buildFilterCriteria(filterBy = {name: '', inStock: false, labels:[]}){

    const { name, inStock, labels } = filterBy

    const criteria = {}
    if (name) {
        criteria.name = {$regex : name,$options:'i'}
    }
    if(inStock && JSON.parse(inStock)){
        criteria.inStock = true
    }
    if(labels){
        criteria.labels = { $in: labels }
    }
    return criteria
}


function _buildSortCriteria(filterBy = {sortBy: ''}){

    console.log('filterBy', filterBy)

    const { sortDes, sortBy } = filterBy

    const criteria = {}

    var dir = 1
    if (sortDes && JSON.parse(sortDes)) dir = -1

    switch (sortBy) {
        case 'txt':
            criteria.name= dir
            break
        case 'price':
            criteria.price= dir
            break
        case 'createdAt':
            criteria.createdAt= dir
            break
    }

    
    return criteria
}

