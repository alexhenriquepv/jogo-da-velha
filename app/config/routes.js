const Chance = require('chance')

module.exports = (app) => {

    const view_dir = app.get('view_dir')
    const chance = new Chance()

    app.get('/', (req, res) => {
      res.sendFile(`${view_dir}/index.html`)
    })

    app.get('/criar-sala', (req, res) => {
        const random_rom = chance.string({ length: 6, casing: 'upper', alpha: true, numeric: true })
        res.redirect(`/sala/${random_rom}`)
    })

    app.get('/entrar-na-sala', (req, res) => {
        res.redirect(`/sala/${req.query.sala_id}`)
    })

    app.get('/sala/:room', (req, res) => {
      res.sendFile(`${view_dir}/jogo.html`)
    })

    return this
}