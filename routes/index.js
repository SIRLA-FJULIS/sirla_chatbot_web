module.exports = function (app) {
        
    app.get('/', (req, res) => {
        res.render('index.ejs')
    })

    app.use('/login', require('./login'));
    app.use('/student', require('./student'));
    app.use('/courses', require('./courses'));

  }