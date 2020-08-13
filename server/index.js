const express = require('express')
const session = require('express-session')
// const bodyparser = require('body-parser')
const consola = require('consola')
const {
    Nuxt,
    Builder
} = require('nuxt')
const app = express()
app.proxy = true
// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 8001
const unhandledRejections = new Map() //捕捉promise reject
process.on('unhandledRejection', (reason, p) => {
    unhandledRejections.set(p, reason)
})
process.on('rejectionHandled', (p) => {
    unhandledRejections.delete(p)
})

// 配置接收post请求中间件
// app.use(bodyparser.urlencoded({extende:true}));
// app.use(bodyparser())
// 配置session中间件
app.use(
    session({
        secret: 'super-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 2 * 60 * 60 * 1000
        }
    })
)
// 配置环境变量中间件
app.use(function(req, res, next) {
    req.session.NODE_ENV = process.env.NODE_ENV
    next()
})
//  缓存token
app.get('/server/token', function(req, res) {
    req.session.token = req.query.token
    return res.json({
        code: 200,
        token: req.query.token,
        msg: '缓存成功'
    })
})
//  缓存用户购物车商品数量
app.get('/server/cartCount', function(req, res) {
    req.session.cartCount = req.query.count
    return res.json({
        code: 200,
        token: req.query.count,
        msg: '缓存成功'
    })
})

//  缓存appToken
app.get('/server/appToken', function(req, res) {
    req.session.appToken = req.query.appToken
    return res.json({
        code: 200,
        msg: '缓存成功！',
        data: {}
    })
})

// 修改城市
app.get('/server/addCity', function(req, res) {
    req.session.cityData = req.query.cityData
    return res.json({
        code: 200,
        msg: '缓存成功！',
        data: {}
    })
})
// 换成我要吐槽来源路径
app.get('/server/fromPath', function(req, res) {
    req.session.fromPath = req.query.fromPath
    return res.json({
        code: 200,
        msg: '缓存成功！',
        data: {}
    })
})
// 缓存个人信息
app.get('/server/userId', function(req, res) {
    req.session.userId = req.query.userId
    return res.json({
        code: 200,
        msg: '缓存成功！',
        data: {}
    })
})
config.dev = process.env.NODE_ENV === 'development'

app.set('port', port)
async function start() {
    // Init Nuxt.js
    const nuxt = new Nuxt(config)

    // Build only in dev mode
    if (config.dev) {
        const builder = new Builder(nuxt)
        await builder.build()
    }

    // Give nuxt middleware to express
    app.use(nuxt.render)

    // Listen the server
    // app.listen(port, host)
    app.listen(8001)
    consola.ready({
        message: `Server listening on http://${host}:${port} - Network:   http://${getIPAdress()}:${port}`,
        badge: true
    })
}
start()

// 获取本机IP
function getIPAdress() {
    const interfaces = require('os').networkInterfaces()
    for (const devName in interfaces) {
        const iface = interfaces[devName]
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i]
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address
            }
        }
    }
}