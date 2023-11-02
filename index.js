var util = require('util');
var mqtt = require('mqtt');
var ModbusRTU = require("modbus-serial");
var Parser = require('binary-parser').Parser;
var state = {};
var state_0 = {};
var state_100 = {};

const commandLineArgs = require('command-line-args')

const optionDefinitions = [
	{ name: 'meterhost', alias: 'h', type: String },
	{ name: 'meterport', alias: 'p', type: String, defaultValue: "/dev/ttyUSB4" },
	{ name: 'id', alias: 'i', type: String, multiple: true, defaultValue: ["sm-drt"] },
	{ name: 'address', alias: 'a', type: Number, multiple: true, defaultValue: [1] },
	{ name: 'wait', alias: 'w', type: Number, defaultValue: 1000 },
	{ name: 'debug', alias: 'd', type: Boolean, defaultValue: false },
	{ name: 'mqtthost', alias: 'm', type: String, defaultValue: "127.0.0.1" },
];

const options = commandLineArgs(optionDefinitions)

console.log("MQTT host     : " + options.mqtthost);
console.log("Modbus Address: " + options.address);
console.log("MQTT Client ID: " + options.id);

var modbusClient = new ModbusRTU();

if (options.meterhost) {
	console.log("Modbus host     : " + options.meterhost);
	modbusClient.connectTcpRTUBuffered(options.meterhost, { port: 502 })
	.then(getMetersValue)
	.catch(function(e) {
        console.log(e.message);
        process.exit(-1);
	});
} else if (options.meterport) {
	console.log("Modbus host     : " + options.meterport);
	modbusClient.connectRTUBuffered(options.meterport, { baudRate: 9600, parity: 'even' })
	.then(getMetersValue)
	.catch(function(e) {
        console.log(e.message);
        process.exit(-1);
	});
}

function sendMqtt(id, data) {
	if(options.debug) {
		console.log('SM-DRT/' + id, JSON.stringify(data));
	}
	MQTTclient.publish('SM-DRT/' + id, JSON.stringify(data));
}

var MQTTclient = mqtt.connect("mqtt://" + options.mqtthost, { clientId: options.id[0] });
MQTTclient.on("connect", function () {
	console.log("MQTT connected");
})

MQTTclient.on("error", function (error) {
	console.log("Can't connect" + error);
	process.exit(-1)
});


const payloadParser_0 = new Parser()
	.seek(0x0E * 2)
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

const payloadParser_100 = new Parser()
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
	/*
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
	*/
	;


async function getMeterValue_0(address, id) {
		return new Promise((resolve) => {
		modbusClient.setID(address);
		modbusClient.setTimeout(2500);
		modbusClient.readHoldingRegisters(0x0, 0x3c).then(function (vals) {
			state_0 = payloadParser_0.parse(vals.buffer);
			if (options.debug) {
				console.log("done_0");
			}
			resolve(state_0);
		})
		.catch(function (e) {
			console.log(e);
			resolve(state_0);
		        process.exit(-1);
		});
	});
	;
}

async function getMeterValue_100(address, id){
	return new Promise((resolve) => {
		modbusClient.setID(address);
		modbusClient.setTimeout(2500);
		modbusClient.readHoldingRegisters(0x100, 0x30).then(function (vals) {
			state_100 = payloadParser_100.parse(vals.buffer);
			Object.assign(state, state_0, state_100);
			if (options.debug) {
				console.log(util.inspect(state));
				console.log("done_100");
			}
			sendMqtt(id, state);
			resolve(state);
		})
		.catch(function (e) {
			console.log(e);
			resolve(state);
		        process.exit(-1);
		});
});
}

async function getMetersValue(meters, id) {
	try {
		var pos = 0;
		// get value of all meters
		for (let address of options.address) {
			var id = options.id[pos];
			if (options.debug) {
				console.log("query: " + address + " / " + id);
			}
			await getMeterValue_0(address, id);
			await getMeterValue_100(address, id);
			pos++;
		}
	} catch (e) {
		// if error, handle them here (it should not)
		console.log(e)
	}
	setTimeout(getMetersValue, options.wait);
}



