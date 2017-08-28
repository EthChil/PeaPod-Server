const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(__dirname + '/peapod.db')
const port = 8090

db.run('CREATE TABLE IF NOT EXISTS peapod (timestamp INTEGER, macAddress TEXT, ssids TEXT, signals TEXT, wifiMacAddresses TEXT)')

app.post('/', (req, res) => {
  let body = ''

  req.on('data', (chunk) => { body += chunk.toString() })

  req.on('end', () => {
    const lines = body.split('\n')
    const sql = db.prepare('INSERT INTO peapod VALUES (?, ?, ?, ?, ?)')

    console.log('timestamp: ' + lines[0])
    console.log('macAddress: ' + lines[1])
    console.log('ssids: ' + lines[2])
    console.log('signals: ' + lines[3])
    console.log('wifiMacAddresses: ' + lines[4])

    sql.run(lines[0], lines[1], lines[2], lines[3], lines[4])
    sql.finalize()
    res.send('Done.')
  })
})

app.get('/data', (req, res) => {
  db.all('SELECT * FROM peapod', (err, rows) => {
    res.json({data: rows})
  })
})

const server = app.listen(port, () => {
  const addr = server.address()
  if (addr.address === '::') addr.address = 'localhost'
  console.log('Peapod Server started at http://%s:%d', addr.address, addr.port)
})

process.on('SIGINT', () => {
    db.close()
    server.close()
})
