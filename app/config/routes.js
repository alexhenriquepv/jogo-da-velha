module.exports = (app) => {

    const view_dir = app.get('view_dir')

    app.get('/', (req, res) => {
      res.sendFile(`${view_dir}/index.html`)
    })

    app.get('/jogo', (req, res) => {
      res.sendFile(`${view_dir}/jogo.html`)
    })

    return this
}
