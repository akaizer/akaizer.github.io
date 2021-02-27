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
var latest_year = undefined;
var latest_month = undefined;

// chart variables
var beerOfTheMonthChart = undefined;

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
$.getJSON("/js/beer.json", data => { beers = data; loadBeerData(); });
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

    // for year/month dropdown i + min_year
    Array.from({ length: max_year - min_year + 1 }, (_, i) => {
        let year = max_year - i;
        $("#years").append($("<option>", {
            value: year,
            text: year
        }));
    });

    Array.from({ length: 12 }, (_, i) => {
        let d = new Date((i + 1) + '/1/2020');

        $("#months").append($("<option>", {
            value: i,
            text: d.toLocaleDateString('default', { month: 'long' })
        }));
    });

    // set default drop down selections
    // For year/month: to latest year and month we have data for
    $("#years option[value=\"" + max_year + "\"]").attr('selected', true);
    let latest_month = Math.max(...Object.keys(beers[max_year]).map(key => parseInt(REVERSE_MONTHS[key])));
    $("#months option[value=\"" + latest_month + "\"]").attr('selected', true);

    // For clubs
    $("#clubs option[value=\"U.S. Microbrewed Beer Club\"").attr('selected', true);

    // set default variables and call club to initialize outputs
    club();
}

// called on date changes and when changing the club
function club() {
    let club = $("#clubs").val();
    let year = parseInt($("#years").val());
    let month = parseInt($("#months").val());
    let anchor = "<a href='https://www.beermonthclub.com/past-selections/" + $("#years").val() + "/" + MONTHS[$("#months").val()] + "' target='_blank'>";
    $("#date_title").html(": " + anchor + $("#months option:selected").text() + " " + $("#years").val() + "</a>");

    // generate club + date data
    if (year != latest_year || month != latest_month || club != latest_club) {
        beersOfTheMonth(club, year, month);
    }

    latest_year = year;
    latest_month = month;
    latest_club = club;
}

// used in onlicks to set the date/time to a specific value
function setDate(year, month) {
    $("#years option").prop('selected', false);
    $("#years option[value=\"" + year + "\"]").prop('selected', true);
    $("#months option").prop('selected', false);
    $("#months option[value=\"" + month + "\"]").prop('selected', true);
    club();
}

// used in onlicks to change date by 1 month
function changeDate(value) {
    let latest_year_ = latest_year;
    let latest_month_ = latest_month;

    if (latest_month + value < 0) {
        latest_year_ -= 1;
        latest_month_ = 11;
    } else if (latest_month + value > 11) {
        latest_year_ += 1;
        latest_month_ = 0;
    } else {
        latest_month_ += value;
    }

    // select new year/month and deselect previous
    if (latest_year_ != latest_year) {
        $("#years option").prop('selected', false);
        $("#years option[value=\"" + latest_year_ + "\"]").prop('selected', true);
    }
    $("#months option").prop('selected', false);
    $("#months option[value=\"" + latest_month_ + "\"]").prop('selected', true);

    club();
}