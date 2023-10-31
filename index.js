var util = require('util');
var mqtt = require('mqtt');
var ModbusRTU = require("modbus-serial");
var Parser = require('binary-parser').Parser;
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
	modbusClient.connectTCP(options.meterhost, { port: 502 }).then(function (data) {
		getMetersValue(options.address, options.id);
	}).catch((error) => {
		console.error(error);
		process.exit(-1);
	});
} else if (options.meterport) {
	console.log("Modbus host     : " + options.meterport);
	modbusClient.connectRTUBuffered(options.meterport, { baudRate: 9600, parity: 'even' }).then(function (data) {
		getMetersValue(options.address, options.id);
	}).catch((error) => {
		console.error(error);
		process.exit(-1);
	});
}

function sendMqtt(id, data) {
	MQTTclient.publish('SM-DRT/' + id, JSON.stringify(data));
}

var MQTTclient = mqtt.connect("mqtt://" + options.mqtthost, { clientId: "SM" });
MQTTclient.on("connect", function () {
	console.log("MQTT connected");
})

MQTTclient.on("error", function (error) {
	console.log("Can't connect" + error);
	process.exit(1)
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


const getMeterValue_0 = async (address, id) => {
	modbusClient.setID(address);
	modbusClient.readHoldingRegisters(0x0, 0x3c).then(function (vals) {
		var state = payloadParser_0.parse(vals.buffer);
		if (options.debug) {
			console.log(util.inspect(vals));
			console.log(util.inspect(state));
		}
		sendMqtt(id, state);
		return state;
	}).catch(function (e) {
		console.log(e);
		return -1;
	});
}

const getMeterValue_100 = async (address, id) => {
	modbusClient.setID(address);
	modbusClient.readHoldingRegisters(0x100, 0x30).then(function (vals) {
		var state = payloadParser_100.parse(vals.buffer);
		if (options.debug) {
			console.log(util.inspect(vals));
			console.log(util.inspect(state));
		}
		sendMqtt(id, state);
		return state;
	}).catch(function (e) {
		console.log(e);
		return -1;
	});
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMetersValue = async (meters, id) => {
	try {
		var pos = 0;
		await modbusClient.setTimeout(2500);
		// get value of all meters
		for (let meter of meters) {
			if (options.debug) {
				console.log("query: " + meter + " / " + id[pos]);
			}
			await getMeterValue_0(meter, id[pos]);
			//		await getMeterValue_100(meter, id[pos]);
			pos++;
			await sleep(options.wait);
		}
	} catch (e) {
		// if error, handle them here (it should not)
		console.log(e)
	} finally {
		// after get all data from salve repeate it again

		setImmediate(() => {
			getMetersValue(meters, id);
		})
	}
}



