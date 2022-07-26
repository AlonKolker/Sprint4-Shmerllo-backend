// const express = require('express')
// const cors = require('cors')

// const toyService = require('./services/toy-service.js')
// const app = express()
// const port = process.env.PORT || 3030;


// app.use(express.static('public'));
// app.use(express.json())
// app.use(cors())


// // LIST
// app.get('/api/toy', (req, res) => {
//     const filterBy = req.query
//     toyService.query(filterBy)
//         .then((toys) => res.send(toys))
//         .catch((err) => res.status(500).send('Cannot get toys'))
// })

// // CREATE 
// app.post('/api/toy', (req, res) => {
//     const { name, price, labels, createdAt, reviews, inStock } = req.body
//     const toy = {
//         name,
//         price,
//         labels,
//         reviews,
//         createdAt,
//         inStock,
//     }
//     toyService.save(toy)
//         .then((savedToy) => res.send(savedToy))
//         .catch((err) => res.status(500).send('Cannot save toy'))
// })

// // UPDATE
// app.put('/api/toy/:toyId', (req, res) => {
//     const { _id, name, price, labels, reviews, createdAt, inStock } = req.body
//     const toy = {
//         _id,
//         name,
//         price,
//         labels,
//         reviews,
//         createdAt,
//         inStock,
//     }
//     toyService.save(toy)
//         .then((savedToy) => res.send(savedToy))
//         .catch((err) => res.status(500).send('Cannot save toy'))
// })


// // READ 
// app.get('/api/toy/:toyId', (req, res) => {
//     const { toyId } = req.params
//     toyService.getById(toyId)
//         .then((toy) => res.send(toy))
//         .catch((err) => res.status(500).send('Cannot get toy'))
// })

// // DELETE
// app.delete('/api/toy/:toyId', (req, res) => {
//     const { toyId } = req.params
//     toyService.remove(toyId)
//         .then(() => res.send('Removed'))
//         .catch((err) => res.status(500).send('Cannot remove toy'))
// })

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

const app = express()
const http = require('http').createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    // Configuring CORS
    const corsOptions = {
        // Make sure origin contains the url your frontend is running on
        origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

const authRoutes = require('./api/auth/auth-routes')
const userRoutes = require('./api/user/user-routes')
const toyRoutes = require('./api/toy/toy-routes')
const reviewRoutes = require('./api/review/review-routes.js')
const { setupSocketAPI } = require('./services/socket-service')


// routes
const setupAsyncLocalStorage = require('./middlewares/setupAls-middleware.js')
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)
setupSocketAPI(http)



// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/toy/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there
app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const logger = require('./services/logger-service')
const port = process.env.PORT || 3030
http.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})