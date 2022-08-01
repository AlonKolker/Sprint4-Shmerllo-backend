const logger = require('./logger.service')

var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })
        socket.on('set-curr-board', board => {
            if (socket.myBoard === board) return
            if (socket.myBoard) {
                socket.leave(socket.myBoard)
                logger.info(`Socket is leaving board ${socket.myBoard} [id: ${socket.id}]`)
            }
            console.log('board', board)
            socket.join(board)
            socket.myBoard = board
            
        })
        socket.on('set-curr-task', taskId => {
            if (socket.myTask === taskId) return
            if (socket.myTask) {
                socket.leave(socket.myTask)
                logger.info(`Socket is leaving task ${socket.myTask} [id: ${socket.id}]`)
            }
            console.log('taskId', taskId)
            socket.join(taskId)
            socket.myTask = taskId
            console.log('socket.myTask', socket.myTask)
        })    
        socket.on('set-user-socket', userId => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId
            console.log('socket.userId:', socket.userId, 'socket.id:', socket.id  )
        })
        socket.on('unset-user-socket', () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            delete socket.userId
        })
        socket.on('board-updated', (board) => {
            broadcast({type:'update-board', data: board, room: socket.myBoard, userId: socket.userId})
        })
        socket.on('task-updated', (task) => {
            console.log('brodcasting', task)
            broadcast({type:'update-task', data: task, room: socket.myTask, userId: socket.userId})
        })
        socket.on('toggele-member', (notification) => {
            console.log('emitToUser',  notification,  'userId:', socket.userId )
            emitToUser({ type:'user-mention', data:notification , userId: notification.mentionedUserId })
        })
      

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    const socket = await _getUserSocket(userId)

    if (socket) {
        logger.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        socket.emit(type, data)
    }else {
        logger.info(`No active socket for user: ${userId}`)
        // _printSockets()
    }
}

// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo, 
    // emit to a specific user (if currently active in system)
    emitToUser, 
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
}
