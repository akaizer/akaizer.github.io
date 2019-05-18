// creates the table and determines nations in need of aid
function analysis() {
  $("#dataBody").empty();
  Object.keys(nations).forEach(nationId => {
    let nation = nations[nationId];
    let tr = document.createElement("tr");

    tr.appendChild(createLinkTag(nation[[NATION]], nationId));
    [RULER, STRENGTH].forEach(attr => {
      tr.appendChild(createTag(nation[attr]));
    });

    // war info
    let offWarCount = nation[[OFF_WAR]].filter(
        war => war[[W_STATUS]] === ACTIVE_WAR).length;
    let defWarCount = nation[[DEF_WAR]].filter(
        war => war[[W_STATUS]] === ACTIVE_WAR).length;
    let warText = (offWarCount + defWarCount) + " (" + offWarCount + ", " + defWarCount + ")";
    tr.appendChild(createTag(warText));

    // aid slot usage info
    let sentAidCount = nation[[SENT_AID]].filter(
        aid => isValidAidDate(aid[[A_DATE]])).length;
    let recvAidCount = nation[[RECV_AID]].filter(
        aid => isValidAidDate(aid[[A_DATE]])).length;
    let totalAid = sentAidCount + recvAidCount;
    let aidText = totalAid + " (" + sentAidCount + ", " + recvAidCount + ")";
    tr.appendChild(createTag(aidText));

    // number of aid slots open, minus peace mode/invalid/etc.
    aidSlotCalculations(tr, nation, nationId, totalAid);

    document.getElementById("dataBody").appendChild(tr);
    updateShadedTag();
  });

  document.getElementById("nationCount").innerText = Object.keys(nations).length.toString();
  document.getElementById("needAid").innerText = needAid.length.toString();
  document.getElementById("sendAid").innerText = sendAid.length.toString();

  $("table").tablesorter({
    sortList: [[2, 1]]
  });
  $("table").trigger("update");

  aidCalculation();
}

// mildly complicated calculations to determine who needs aid and who can send aid
function aidSlotCalculations(tr, nation, nationId, totalAid) {
  let strength = document.getElementById("strength").value;
  if (NOAID.indexOf(parseInt(nationId)) === -1) {
    if (parseFloat(nation[[STRENGTH]].replace(",", "")) > parseFloat(strength)) {
      if (nation[[PEACE_MODE]]) {
        tr.appendChild(createTag("-1 (Peace Mode)"));
        tr.style.backgroundColor = "yellow";
      } else {
        tr.appendChild(createTag(6 - totalAid));
        if (6 - totalAid > 1) {
          sendAid.push(nationId);
        }
      }
    } else {
      // assume 5 open slots if below strength threshold
      let aidSlotCount = ((5 - totalAid) === -1) ? 0 : (5 - totalAid);
      if (aidSlotCount > 0) {
        needAid.push(nationId)
      }
      tr.appendChild(createTag(aidSlotCount));
    }
  } else {
    tr.appendChild(createTag("-1 (Not Eligible)"));
    tr.style.backgroundColor = "orange";
  }
}

// calculations to determine who needs to aid, which can then be used in messages to the alliance
function aidCalculation() {
  document.getElementById("nonWarAid").innerHTML = "";
  document.getElementById("warAid").innerHTML = "";
  document.getElementById("genericWarAid").innerHTML = "";
  document.getElementById("availableAid").innerHTML = "";

  needAid.forEach(nationId => {
    if (NONWARAID.indexOf(parseInt(nationId)) !== -1) {
      document.getElementById("nonWarAid").innerHTML += nations[nationId][[RULER]] + " - " +
          "<a href='https://www.cybernations.net/nation_drill_display.asp?Nation_ID=" + nationId
          + "' target='_blank'>https://www.cybernations.net/nation_drill_display.asp?Nation_ID="
          + nationId + "</a><br />";
    } else {
      let offWarCount = nations[nationId][[OFF_WAR]].filter(
          war => war[[W_STATUS]] === ACTIVE_WAR).length;
      let defWarCount = nations[nationId][[DEF_WAR]].filter(
          war => war[[W_STATUS]] === ACTIVE_WAR).length;

      if (WARAID.indexOf(parseInt(nationId)) !== -1) {
        document.getElementById("warAid").innerHTML += nations[nationId][[RULER]] + " - " +
            "<a href='https://www.cybernations.net/nation_drill_display.asp?Nation_ID=" + nationId
            + "' target='_blank'>https://www.cybernations.net/nation_drill_display.asp?Nation_ID="
            + nationId + "</a><br />";
      } else {
        if (offWarCount + defWarCount > 0) {
          document.getElementById("genericWarAid").innerHTML += nations[nationId][[RULER]] + " - " +
              "<a href='https://www.cybernations.net/nation_drill_display.asp?Nation_ID=" + nationId
              + "' target='_blank'>https://www.cybernations.net/nation_drill_display.asp?Nation_ID="
              + nationId + "</a><br />";
        }
      }
    }
  });

  let counter = 0;
  let group = createRulerList();
  sendAid.forEach(nationId => {
    counter += 1;
    if (counter > 25) {
      counter = 0;
      document.getElementById("availableAid").appendChild(group);
      group = createRulerList();
    }
    group.innerHTML += nations[nationId][[RULER]] + "<br />";
  });
  document.getElementById("availableAid").appendChild(group);
}

function createRulerList() {
  let group = document.createElement("div");
  group.className = "col-md-3 border";
  group.addEventListener("click", (e) => {
    copyDivToClipboard(e);
  });
  return group;
}

// valid date for aid, i.e. this aid slot is still in use
// aid is valid for 10 days from send date
function isValidAidDate(data) {
  let date = data.split(' ')[0];
  let centralTimeAidDate = new Date(date).toLocaleString("en-US", {timeZone: "America/Chicago"});
  let centralTime = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});

  let aidDate = new Date(centralTimeAidDate);
  let now = new Date(centralTime);
  let diff = Math.abs(now.getTime() - aidDate.getTime());

  return (diff / (1000 * 60 * 60 * 24)) <= 10;
}

function createLinkTag(data, id) {
  let td = document.createElement("td");
  td.innerHTML = "<a href='https://www.cybernations.net/nation_drill_display.asp?Nation_ID=" + id
      + "' target='_blank'>" + data + "</a> (" + id + ")";
  return td;
}

function createTag(data) {
  let td = document.createElement("td");
  td.innerText = data;
  return td;
}

// shade the aid cell for better visual indicator
function updateShadedTag() {
  let cells = document.getElementById("dataBody").lastChild.lastChild;
  let openSlots = parseInt(cells.innerText);
  if (openSlots > 0) {
    let opacity = (openSlots - 1) / 5.0;
    cells.style.backgroundColor = "rgba(256, 0, 0, " + opacity + ")";
  }
}

function copyDivToClipboard(element) {
  let selection = window.getSelection();
  let range = document.createRange();
  range.selectNodeContents(element.target);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand("Copy");
}