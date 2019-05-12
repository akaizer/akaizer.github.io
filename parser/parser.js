// the nations of interest
let nations = {};
let needAid = []; // list of nation IDs that have open aid slots and ergo need aid, based on strength < X
let sendAid = []; // list of nations Ids that have open aid slots and should send aid, based on strength > X
let NOAID = []; // list of nations from the invalid.txt file who should not be allowed to have aid
let WARAID = [];
let NONWARAID = [];

// Note that a base nation has 4 aid slots, 5 with foreign ministry, and 6 with a DRA wonder -- this data does not contain that information.
// However, we can safely assume almost all nations have the FM and any nation above a certain size will have a DRA.
document.getElementById("reload").style.height =
    document.getElementById("files").offsetHeight + 'px'; // for visual reasons
document.getElementById("reload").onclick = async function () {
  dataLoad();
};

document.getElementById("files").onchange = async function () {
  const files = this.files;

  for (let index = 0; index < files.length; index++) {
    let result = await parse(files.item(index));
    if (files[index].name.indexOf('Aid_') !== -1) {
      aidFileContent = result;
    } else if (files[index].name.indexOf('War_') !== -1) {
      warFileContent = result;
    } else if (files[index].name.indexOf('Nation_') !== -1) {
      nationFileContent = result;
    } else if (files[index].name === 'invalid.txt') {
      NOAID = parseSpecial(result);
    } else if (files[index].name === 'non-war-aid.txt') {
      NONWARAID = parseSpecial(result);
    } else if (files[index].name === 'war-aid.txt') {
      WARAID = parseSpecial(result);
    }
  }

  dataLoad();
};

function parseSpecial(data) {
  let list = [];
  data.forEach(line => {
    line = line.split("//")[0].trim();
    if (line.length !== 0) {
      list.push(parseInt(line));
    }
  });
  return list;
}

function dataLoad() {
  // zero out any old data
  nations = {};
  needAid = [];
  sendAid = [];

  // parse results for nations of interest
  parseNations();
  parseAid();
  parseWar();
  analysis();
}

function parseNations() {
  let allianceOfInterest = document.getElementById("allianceOfInterest").value.toLowerCase();

  nationFileContent.forEach(line => {
    let nation = split(line);

    let alliance = nation[N_ALLIANCE];
    let status = nation[N_ALLIANCE_STATUS];
    if (alliance !== undefined && alliance.toLowerCase() === allianceOfInterest && status
        !== "Pending") {
      nations[getValue(nation, N_NATION_ID)] = {
        [NATION]: getValue(nation, N_NATION),
        [RULER]: getValue(nation, N_RULER),
        [ALLIANCE]: getValue(nation, N_ALLIANCE),
        [PEACE_MODE]: getValue(nation, N_PEACE_MODE) === 'Peace Mode',
        [STRENGTH]: getValue(nation, N_STRENGTH),
        [SENT_AID]: [],
        [RECV_AID]: [],
        [DEF_WAR]: [],
        [OFF_WAR]: [],
      };
    }
  });
}

function parseAid() {
  aidFileContent.forEach(line => {
    let aid = split(line);
    let sendingId = aid[A_SENDING_ID];
    let receivingId = aid[A_RECEIVING_ID];

    if (sendingId in nations) {
      nations[sendingId][SENT_AID].push(aid);
    }
    if (receivingId in nations) {
      nations[receivingId][RECV_AID].push(aid);
    }
  });
}

function parseWar() {
  warFileContent.forEach(line => {
    let war = split(line);
    let offensiveId = war[W_SENDING_ID];
    let defensiveId = war[W_RECEIVING_ID];
    if (offensiveId in nations) {
      nations[offensiveId][OFF_WAR].push(war);
    } else if (defensiveId in nations) {
      nations[defensiveId][DEF_WAR].push(war);
    }
  });
}

function split(str) {
  return str.split("|");
}

function getValue(arr, index) {
  return arr[index];
}

function parse(file) {
  return new Promise((resolve, reject) => {
    let content = '';
    const reader = new FileReader();
    // Wait till complete
    reader.onloadend = function (e) {
      content = e.target.result;
      const result = content.split(/\r\n|\n/);
      resolve(result);
    };
    // Make sure to handle error states
    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsText(file);
  });
}

