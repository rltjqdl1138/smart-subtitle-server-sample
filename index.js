const utf8 = require('utf8')
const net = require('net')

const xlsx = require('xlsx')
const excelFile = xlsx.readFile('exel.xlsx')
const sheetName = excelFile.SheetNames[0]
const firstSheet = excelFile.Sheets[sheetName]
const jsonData = xlsx.utils.sheet_to_json(firstSheet, {defval:""})

const list = jsonData.map( e => converting(e))
function converting(item){
    return {
        "KO":item["한국어"],
        "EN":item["영어"],
        "CH":item["중국어"],
        "JP":item["일본어"]
    }
}
//const raw = require('raw-socket')
//const socket = raw.createSocket({protocol: raw.Protocol.TCP})
class tcpServer {
	constructor(port) {
		this.context = {
			port: port
		}
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
                if(data.search('abcd') === 0)
                    this.onRead(data.replace('abcd',''))
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
        const index = parseInt(str, 10)
        console.log(index)
        if(isNaN(index)) return;
        
        this.send(JSON.stringify(list[str]))
    }
	//Create Connection Successfully
	onCreate(socket) {
        this.clients.push(socket)
		console.log("onCreate", socket.remoteAddress, socket.remotePort)
	}

	//Close Connection Successfully
	onClose(socket) {
		console.log("onClose", socket.remoteAddress, socket.remotePort)
	}
}
function writeData(socket, data){
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