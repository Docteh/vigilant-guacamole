#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2));
const MemoryMap = require('nrf-intel-hex');
const fs = require('fs');
const path = require('path');
var unifiedTape = {
  snoopLocations: [
    0x08002800, // most recent address, for all targets
    0x08008000, 0x08010000, // first go
    0x08040000, 0x24010000, // speculation for H7
  ],
  configLocations: [
    0x08002808, 0x080FC000, 0x0807C000, 0x080F8000,
  ],
  minimumConfigSize: 4096 - 8, // 4k minus two addresses
  maximumConfigSize: 131072, // 128*1024
  findOffset: function (map) {
    var sectionStart, sectionFinish, sectionSize;
    for (let location of this.snoopLocations) {
      //console.log('looking at '+location);
      sectionStart = memMap.getUint32(location,true);
      sectionFinish = memMap.getUint32(location + 4,true);
      sectionSize = sectionFinish - sectionStart;
      console.dir({section: [sectionStart, sectionFinish, sectionSize]});
      // Two zeros clearly means no config section. Fail faster.
      if (sectionStart == 0 && sectionFinish == 0) {
        return undefined;
      }
      if (sectionSize >= this.minimumConfigSize && sectionSize <= this.maximumConfigSize && this.configLocations.includes(sectionStart)) {
        console.log('found good offset of', sectionStart, 'at', location, 'it is', sectionSize, 'bytes.');
        return sectionStart;
      }
    }
  }
};

// Main CLI program starts here
if (args.config == undefined || (args.firmware == undefined && args.offset==undefined)) {
    complainArguments();
    process.exitCode = 1;
} else {
    var configFilename = args.config;
    var firmwareHex = args.firmware;
    var offset;
    var outputHex = args.output;
    if (outputHex == undefined) {
        if (firmwareHex != undefined) {
            outputHex = path.basename(firmwareHex,'.hex')
              + '_' + path.basename(configFilename,'.config') + '.hex';
        } else {
            outputHex = path.basename(configFilename) + '.hex';
        }
    }
    var memMap;
    if (firmwareHex != undefined) {
        memMap = MemoryMap.fromHex(fs.readFileSync(firmwareHex,'utf8'));
        offset = unifiedTape.findOffset(memMap);
    } else {
        memMap = new MemoryMap();
        offset = args.offset;
    }
    if (offset == undefined && firmwareHex != undefined) {
        console.error('Was unable to find offset. Is "' + path.basename(firmwareHex) + '" a unified target?');
    } else {
        console.log('Using offset of ' + offset);

        var unifiedConfig = fs.readFileSync(configFilename);
        //console.log('length is ' + unifiedConfig.length);
        if (args.padnull) {
            console.log('Adding null to end of config file');
            // Null termination is currently required
            var nullBuffer = Buffer.from([0]);
            unifiedConfig = Buffer.concat([unifiedConfig,nullBuffer]);
        }
        // TODO look at length of buf, and care a little.
        console.log('Config "' + configFilename + '" is', unifiedConfig.length, 'bytes');
        memMap.set(offset, unifiedConfig);

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
