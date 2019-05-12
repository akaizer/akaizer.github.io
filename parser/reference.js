/**
 * Variables to parse and manage the data.
 */
const NATION_ID = "nationId";
const RULER = "ruler";
const NATION = "nation";
const ALLIANCE = "alliance";
const PEACE_MODE = "isPeaceMode";
const STRENGTH = "strength";
const SENT_AID = "sentAid";
const RECV_AID = "receivedAid";
const DEF_WAR = "defensiveWar";
const OFF_WAR = "offensiveWar";

/// aid data, data variables prefixed with A_ (for aid)
var aidFileContent;
const A_SENDING_ID = 0;
const A_RECEIVING_ID = 6;
const A_MONEY = 13;
const A_TECHNOLOGY = 14;
const A_SOLDIERS = 15;
const A_DATE = 16;

// nation data, data variables prefixed with N_ (for nation)
var nationFileContent;
const N_NATION_ID = 0;
const N_RULER = 1;
const N_NATION = 2;
const N_ALLIANCE = 3;
const N_ALLIANCE_STATUS = 6;
const N_PEACE_MODE = 14; // cannot send aid if in peacemode
const N_STRENGTH = 18;

// war data, data variables prefixed with W_ (for war)
var warFileContent;
const W_SENDING_ID = 0;
const W_RECEIVING_ID = 6;
const W_STATUS = 12;
const W_BEGIN = 13;
const W_END = 14;
const ACTIVE_WAR = "Active";