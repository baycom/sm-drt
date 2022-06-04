var util=require('util');
var mqtt=require('mqtt');
var ModbusRTU = require("modbus-serial");
var Parser = require('binary-parser').Parser;
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
	{ name: 'path', alias: 'p', type: String, defaultValue: "/dev/ttyUSB4" },
	{ name: 'mode', alias: 'm', type: Number, defaultValue: 0 },
	{ name: 'id', alias: 'i', type: String, multiple: true, defaultValue: ["sm-drt"] },
	{ name: 'address', alias: 'a', type: Number, multiple: true, defaultValue: [1] },
	{ name: 'wait', alias: 'w', type: Number, defaultValue: 1000 },
  	{ name: 'debug', alias: 'd', type: Boolean, defaultValue: false },
	{ name: 'mqtthost', alias: 'h', type: String, defaultValue: "127.0.0.1" },
  ];

const options = commandLineArgs(optionDefinitions)

console.log("MQTT host     : " + options.mqtthost);
console.log("Modbus Address: " + options.address);
console.log("MQTT Client ID: " + options.id);

var modbusClient = new ModbusRTU();

modbusClient.connectRTUBuffered(options.path, { baudRate: 9600, parity: 'even' }).catch((error) => {
  console.error(error);
  process.exit(-1);
});

modbusClient.setTimeout(500);

function sendMqtt(id, data) {
	MQTTclient.publish('SM-DRT/' + id, JSON.stringify(data));
}
  
var MQTTclient = mqtt.connect("mqtt://"+options.mqtthost,{clientId: "SM-DRT"});
	MQTTclient.on("connect",function(){
	console.log("MQTT connected");
})

MQTTclient.on("error",function(error){
		console.log("Can't connect" + error);
		process.exit(1)
	});


const payloadParser1 = new Parser()
	.seek(0x0E*2)
	.floatbe('L1Voltage')
	.floatbe('L2Voltage')
	.floatbe('L3Voltage')
	.floatbe('GridFrequency')
	.floatbe('L1Current')
	.floatbe('L2Current')
	.floatbe('L3Current')
	.floatbe('TotalActivePower')
	.floatbe('L1ActivePower')
	.floatbe('L2ActivePower')
	.floatbe('L3ActivePower')
	.floatbe('TotalReactivePower')
	.floatbe('L1ReactivePower')
	.floatbe('L2ReactivePower')
	.floatbe('L3ReactivePower')
	.floatbe('TotalApparentPower')
	.floatbe('L1ApparentPower')
	.floatbe('L2ApparentPower')
	.floatbe('L3ApparentPower')
	.floatbe('TotalPowerFactor')
	.floatbe('L1PowerFactor')
	.floatbe('L2PowerFactor')
	.floatbe('L3PowerFactor')
	;
function getPayload1(data) {
	return payloadParser1.parse(data);
}

const payloadParser2 = new Parser()
	.floatbe('TotalActiveEnergy')
	.floatbe('L1TotalActiveEnergy')
	.floatbe('L2TotalActiveEnergy')
	.floatbe('L3TotalActiveEnergy')
	.floatbe('ForwardActiveEnergy')
	.floatbe('L1ForwardActiveEnergy')
	.floatbe('L2ForwardActiveEnergy')
	.floatbe('L3ForwardActiveEnergy')
	.floatbe('ReverseActiveEnergy')
	.floatbe('L1ReverseActiveEnergy')
	.floatbe('L2ReverseActiveEnergy')
	.floatbe('L3ReverseActiveEnergy')
	.floatbe('TotalReactiveEnergy')
	.floatbe('L1TotalReactiveEnergy')
	.floatbe('L2TotalReactiveEnergy')
	.floatbe('L3TotalReactiveEnergy')
	.floatbe('ForwardReactiveEnergy')
	.floatbe('L1ForwardReactiveEnergy')
	.floatbe('L2ForwardReactiveEnergy')
	.floatbe('L3ForwardReactiveEnergy')
	.floatbe('ReverseReactiveEnergy')
	.floatbe('L1ReverseReactiveEnergy')
	.floatbe('L2ReverseReactiveEnergy')
	.floatbe('L3ReverseReactiveEnergy')
	.floatbe('T1TotalActiveEnergy')
	.floatbe('T1ForwardActiveEnergy')
	.floatbe('T1ReverseActiveEnergy')
	.floatbe('T1TotalReactiveEnergy')
	.floatbe('T1ForwardReactiveEnergy')
	.floatbe('T1ReverseReactiveEnergy')
	.floatbe('T2TotalActiveEnergy')
	.floatbe('T2ForwardActiveEnergy')
	.floatbe('T2ReverseActiveEnergy')
	.floatbe('T2TotalReactiveEnergy')
	.floatbe('T2ForwardReactiveEnergy')
	.floatbe('T2ReverseReactiveEnergy')
	.floatbe('T3TotalActiveEnergy')
	.floatbe('T3ForwardActiveEnergy')
	.floatbe('T3ReverseActiveEnergy')
	.floatbe('T3TotalReactiveEnergy')
	.floatbe('T3ForwardReactiveEnergy')
	.floatbe('T3ReverseReactiveEnergy')
	.floatbe('T4TotalActiveEnergy')
	.floatbe('T4ForwardActiveEnergy')
	.floatbe('T4ReverseActiveEnergy')
	.floatbe('T4TotalReactiveEnergy')
	.floatbe('T4ForwardReactiveEnergy')
	.floatbe('T4ReverseReactiveEnergy')
	;
function getPayload2(data) {
	return payloadParser2.parse(data);
}

const getMeterValue2st = async (address, id) => {
    try {
		modbusClient.setID(address);
		let vals = await modbusClient.readHoldingRegisters(0x100, 0x60);
		var state = getPayload2(vals.buffer);
		if(options.debug) {
			console.log(util.inspect(state));
		}
		sendMqtt(id, state);
		return state;
	} catch(e){
		return -1;
    }
}

const getMeterValue1st = async (address, id) => {
    try {
		modbusClient.setID(address);
		let vals = await modbusClient.readHoldingRegisters(0x0, 0x3c);
		var state = getPayload1(vals.buffer);
		if(options.debug) {
			console.log(util.inspect(state));
		}
		sendMqtt(id, state);
		return state;
	} catch(e){
		return -1;
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMetersValue = async (meters, id) => {
    try{
    	var pos=0;
        // get value of all meters
        for(let meter of meters) {
        	if(options.debug) {
	        	console.log("query: "+meter+" / "+id[pos]);
		}
        	await getMeterValue1st(meter, id[pos]);
        	await getMeterValue2st(meter, id[pos++]);
        	await sleep(options.wait);
	}
    } catch(e){
        // if error, handle them here (it should not)
        console.log(e)
    } finally {
        // after get all data from salve repeate it again
        setImmediate(() => {
            getMetersValue(meters, id);
        })
    }
}

// start get value
getMetersValue(options.address, options.id);


