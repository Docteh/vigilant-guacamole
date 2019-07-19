var args = require('minimist')(process.argv.slice(2));
const MemoryMap = require('nrf-intel-hex');
const fs = require('fs');
console.dir(args);

if (args.config == undefined || (args.firmware == undefined && args.offset==undefined)) {
    complainArguments();
    process.exitCode = 1;
} else {
    var configFilename = args.config;
    var firmwareHex = args.firmware;
    var offset;
    var outputHex = args.output;
    if (outputHex == undefined) {
        outputHex = path.basename(configFileName) + '.hex';
    }
    var outputHex = args.output;
    var memMap;
    if (firmwareHex != undefined) {
        memMap = MemoryMap.fromHex(fs.readFileSync(firmwareHex,'utf8'));
        // File is loaded, can go looking for offset.
        console.log(memMap.getUint32(0x08008000,true));
        console.log(memMap.getUint32(0x08010000,true));
        // Hard coded for all acceptable values
        // TODO either slightly or massively improve.
        if (memMap.getUint32(0x08008000,true) == 0x080FC000) {
            offset = memMap.getUint32(0x08008000,true);
        }
        if (memMap.getUint32(0x08008000,true) == 0x0807C000) {
            offset = memMap.getUint32(0x08008000,true);
        }
        if (memMap.getUint32(0x08010000,true) == 0x080F8000) {
            offset = memMap.getUint32(0x08010000,true);
        }
    } else {
        memMap = new MemoryMap();
        offset = args.offset;
    }
    if (offset == undefined) {
        console.error('Was unable to find offset');
    } else {
        console.log('Found offset of ' + offset);

        var unifiedConfig = fs.readFileSync(configFilename);
        console.log('length is ' + unifiedConfig.length);
        // Null termination is currently required
        var nullBuffer = Buffer.from([0]);
        var buf = Buffer.concat([unifiedConfig,nullBuffer]);
        // TODO look at length of buf, and care a little.
        console.log(buf.length);
        memMap.set(offset,Uint8Array.from(buf));

        fs.writeFileSync(outputHex, memMap.asHexString());
        console.log('wrote to ' + outputHex);
    }
}

function complainArguments() {
    console.log("this script needs some arguments");
    console.log(" --config CONFIG --offset OFFSET");
    console.log(" --config CONFIG --firmware FIRMWARE");
    console.log(" [--output filename]");
}
