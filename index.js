const utf8 = require('utf8')
const net = require('net')

const xlsx = require('xlsx')
const excelFile = xlsx.readFile('exel.xlsx')
const sheetName = excelFile.SheetNames[0]
const firstSheet = excelFile.Sheets[sheetName]
const jsonData = xlsx.utils.sheet_to_json(firstSheet, {defval:""})

const list = jsonData.reduce( (prev, e, index) =>
	[...prev, converting(e, index)],
	[{
		"current_index": 0,
		"last_index":jsonData.length+1,
		"KO":"",
		"EN":"",
		"CH":"",
		"JP":"",
	}]
)
list.push({
	"current_index": jsonData.length+1,
	"last_index":jsonData.length+1,
	"KO":"",
	"EN":"",
	"CH":"",
	"JP":"",
})
function converting(item, index){
    return {
		"current_index": index,
		"last_index":jsonData.length+1,
        "KO":item["한국어"],
        "EN":item["영어"],
        "CH":item["중국어"],
        "JP":item["일본어"],
    }
}
//const raw = require('raw-socket')
//const socket = raw.createSocket({protocol: raw.Protocol.TCP})
class tcpServer {
	constructor(port) {
		this.context = {
			port: port
		}
		
		this.lastData = 0
		this.merge = {}
        this.clients = []
		this.server = net.createServer((socket) => {
			//Client connect event
			this.onCreate(socket)
            
            socket.setEncoding('utf8')
			//Error event 핸들러 등록
			socket.on('error', (exception) => {
				this.onClose(socket)
			})
			//Close event 핸들러 등록
			socket.on('close',() => {
				this.onClose(socket)
			})
			//Data event 핸들러 등록
			socket.on('data', (_data) => {
                const data = _data.toString()
				this.onRead(data)
			})
		})	
		
		//Server Object's error
		this.server.on('error', (err)=>{
			console.log(err)
		})
        this.server.on('message', message =>{
            console.log(message)
        })

		//Start Listening
		this.server.listen(port, () => {
			console.log('listen', this.server.address())
		})
        this.send = function( message ){
            const buf = Buffer.from(message+'\n', 'utf8');
            this.clients.forEach( e => writeData(e, buf))
        }
	}
	onRead(str){
        const _index = parseInt(str, 10)
        if(isNaN(_index)) return;
		const now = new Date()
		console.log(`onRead:: Index:${_index} .../${now.toLocaleString()}/`)
		const index = _index >= list.length ? list.length-1 : _index
        this.lastData = index
		console.log(`* Valid Sockets: ${this.clients.length}`)
		console.log( `Subtitles ... ( \x1b[37m${index}\x1b[0m / ${list.length})\n` +
			`  [KO] ${list[index].KO}\n` +
			`  [EN] ${list[index].EN}\n` +
			`  [CH] ${list[index].CH}\n` +
			`  [JP] ${list[index].JP}\n\n`
		)
        this.send(JSON.stringify(list[index]))
    }
	//Create Connection Successfully
	onCreate(socket) {
        this.clients.push(socket)
		console.log("onCreate", socket.remoteAddress, socket.remotePort)
		const lastData = JSON.stringify(list[this.lastData])
		const buf = Buffer.from(lastData+'\n', 'utf8');
		//console.log(buf)
		socket.write(buf)
	}

	//Close Connection Successfully
	onClose(socket) {
		const ind = this.clients.findIndex( e => e && e.remoteAddress === socket.remoteAddress && e.remotePort === socket.remotePort)
		if(ind >=0 && this.clients[ind]){
			console.log("onClose", socket.remoteAddress, socket.remotePort)
			this.clients[ind] = undefined
		}
	}
}
function writeData(socket, data){
	if(!socket) return;
    var success = !socket.write(data);
    if (!success){
      (function(socket, data){
        socket.once('drain', function(){
          writeData(socket, data);
        });
      })(socket, data);
    }
}
const tcpserver = new tcpServer(30001)