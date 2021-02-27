// Top level file that contains variables and "global" functions.
// Analysis files to generate charts or tables in individual spots.

// data or results stored from data
var beers = {};
var min_year = (new Date()).getFullYear();
var max_year = (new Date()).getFullYear();
var MONTHS = {
    0: 'jan', 1: 'feb', 2: 'mar', 3: 'apr', 4: 'may', 5: 'june',
    6: 'july', 7: 'aug', 8: 'sept', 9: 'oct', 10: 'nov', 11: 'dec'
}
var REVERSE_MONTHS = {};
Object.keys(MONTHS).forEach(key => REVERSE_MONTHS[MONTHS[key]] = key);
Chart.plugins.unregister(ChartDataLabels);

// UI variables to track latest value
var latest_club = undefined;

// chart variables
var beerOfTheMonthChart = undefined;
var uniqueBreweriesChart = undefined;
var averageAbvChart = undefined;
var averageAbvMonthChart = undefined;
var averageIbuChart = undefined;
var averageIbuMonthChart = undefined;

// chart helper functions
const asc = arr => arr.sort((a, b) => a - b);
const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

// load data and setup UI dropdowns
$.getJSON("js/beer.json", data => { beers = data; loadBeerData(); });
function loadBeerData() {
    let clubs = new Set();
    let years = Object.keys(beers).map(years => parseInt(years));
    min_year = Math.min(...years);
    max_year = Math.max(...years);
    for (let year = min_year; year <= max_year; year++) {
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                for (count in beers[year][month]) {
                    let beer = beers[year][month][count];
                    beer['clubs'].forEach(club => clubs.add(club));
                }
            }
        }
    }

    // for club-based chart dropdown 
    clubs.forEach(club => {
        $("#clubs").append($("<option>", {
            value: club,
            text: club
        }));
    });

    // For clubs
    $("#clubs option[value=\"U.S. Microbrewed Beer Club\"").attr('selected', true);

    // set default variables and call club to initialize outputs
    club();
}

// when changing the club, update all charts as appropriate
function club() {
    let club = $("#clubs").val();

    if (club != latest_club) {
        uniqueBreweries(club);
        averageAbv(club);
        averageAbvMonth(club);
        averageIbu(club);
        averageIbuMonth(club);
    }

    latest_club = club;
}
