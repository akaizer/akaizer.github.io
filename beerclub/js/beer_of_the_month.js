function beersOfTheMonth(club, year, month) {
    $("#monthlyBeers").empty();
    $("#monthlyBreweries").empty();
    if (Object.keys(beers[year]).includes(MONTHS[month])) {
        let breweries_ = new Set();
        beers[year][MONTHS[month]].forEach(beer => {
            if (beer['clubs'].includes(club)) {
                addBeerCard(beer);
                breweries_.add(beer['brewery']);
            }
        });

        generateChart(Array.from(breweries_), club);
    } else {
        $("#monthlyBeers").append($("<div>", {
            class: 'col-12 text-center',
            text: "Year/Month not in current data."
        }));
        generateChart([], club);
    }
}

function createBreweryCards(data) {
    Object.keys(data).forEach(brewery => {
        let occurences = []
        Object.keys(data[brewery]).forEach(datum => occurences.push(data[brewery][datum]));
        occurences.sort((a, b) => { return b.x - a.x; })

        let content = "<h5 class='card-title text-center'>" + brewery + "</h5>";
        content += "<hr style='margin-top: 0rem; margin-bottom: 0rem;' />";
        content += "<div class='card-text'>";
        occurences.forEach(datum => {
            let date = MONTHS[datum.x.getMonth()] + ' ' + datum.x.getFullYear();
            date = date[0].toUpperCase() + date.slice(1);
            date = "<a href='#' onclick='setDate(" + datum.x.getFullYear() + "," + datum.x.getMonth() + ")'>" + date + "</a>";

            let beers = '';
            let beers_ = datum['beers'].sort();
            beers_.forEach(beer => beers += beer + '<br/>')

            content += "<div class='row col-12 no-gutters'>";
            content += "<div class='col-4'><strong>" + date + "</strong>:</div>";
            content += "<div class='col'>" + beers + "</div>";
            content += "</div>";
            content += "<hr style='margin-top: 0.2rem; margin-bottom: 0.2rem;' />";
        });
        content += "</div>";
        $("#monthlyBreweries")
            .append($("<div>", {
                class: "card col-6 col-lg-4 mx-auto"
            }).append($("<div>", {
                class: "card-body",
                html: content
            })));
    });
}

function addBeerCard(beer) {
    let content = "<h5 class='card-title text-center'>" + beer['name'] + "</h5>";
    content += "<div class='card-text'>";
    content += contentConverter('Brewery', 'brewery', beer);
    content += contentConverter('Style', 'Style', beer);
    content += contentConverter('ABV', 'Alcohol by Volume', beer);
    content += contentConverter('IBU', 'Int’l Bittering Units (IBUs)', beer);
    content += "<hr style='margin: 0.25em 0em' />"
    content += contentConverter('Glassware', 'Suggested Glassware', beer, 'small');
    content += contentConverter('Temp', 'Serving Temperature', beer, 'small');
    content += "<hr style='margin: 0.25em 0em' />"
    content += contentConverter('Malts', 'Malts', beer, 'x-small');
    content += contentConverter('Hops', 'Hops', beer, 'x-small');
    content += contentConverter('Clubs', 'clubs', beer, 'x-small');
    content += otherAppearances(beer);
    content += "</div>";

    $("#monthlyBeers")
        .append($("<div>", {
            class: "card col-3"
        }).append($("<div>", {
            class: "card-body",
            html: content
        })));
}

function otherAppearances(beer) {
    let dates = "";
    for (let year = min_year; year <= max_year; year++) {
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                beers[year][month].forEach(beer_ => {
                    if (beer['name'] == beer_['name']) {
                        if (dates.length > 0) dates += ", ";
                        dates += "<a href='#' class='link' onclick='setDate(" + year + "," + month_value + ")'>";
                        dates += (month_value + 1) + "/" + year;
                        if (beer['brewery'] != beer_['brewery']) {
                            dates += "<sup>*</sup>"
                        }
                        dates += "</a>";
                    }
                });
            }
        }
    }

    let content = "<div class='row col-12 no-gutters' style='font-size: x-small;'>";
    content += "<div class='col-3'><strong>Dates</strong>:</div>";
    content += "<div class='col'>" + dates + "</div>";
    content += "</div>";
    return content;
}

// label is for UI, key is for the JSON blob, beer is obvious, size is to make font larger/smaller
function contentConverter(label, key, beer, size) {
    let value = beer[key] != undefined ? beer[key] : "<span class='unknown'>not provided</span>";
    let font_size = size != undefined ? 'font-size: ' + size : '';
    let content = "<div class='row col-12 no-gutters' style='" + font_size + "'>";
    content += "<div class='col-12 col-md-3'><strong>" + label + "</strong>:</div>";
    content += "<div class='col'>" + value + "</div>";
    content += "</div>";
    return content;
}

function generateChart(breweries, club) {
    let data_dict = {};
    breweries.forEach(key => { data_dict[key] = {} });

    // given a brewery, find all years with a match
    for (let year = min_year; year <= max_year; year++) {
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                beers[year][month].forEach(beer => {
                    if (beer['clubs'].includes(club) && breweries.includes(beer['brewery'])) {
                        let date = new Date(year, month_value + 1, 0);
                        let key = date.toString();
                        if (!Object.keys(data_dict[beer['brewery']]).includes(key)) {
                            data_dict[beer['brewery']][key] = { 'x': date, 'y': breweries.indexOf(beer['brewery']) + 1, 'beers': [] }; //
                        }
                        data_dict[beer['brewery']][key]['beers'].push(beer['name']);
                    }
                });
            }
        }
    }

    createBreweryCards(data_dict);

    let datasets = [];
    Object.keys(data_dict).forEach(key => {
        datasets.push({
            data: Object.values(data_dict[key]),
            label: key,
            backgroundColor: a2hex(key)
        });
    });

    if (beerOfTheMonthChart == undefined) {
        let ctx = document.getElementById('beerOfTheMonth').getContext('2d');
        beerOfTheMonthChart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: datasets },
            plugins: [ChartDataLabels],
            options: {
                maintainAspectRatio: false,
                barValueSpacing: 20,
                title: {
                    display: true,
                    fontSize: 18,
                    text: "Brewery History"
                },
                legend: {
                    position: 'bottom'
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        position: 'bottom',
                        ticks: {
                            min: new Date(1995, 0, 0),
                            max: new Date((new Date()).getFullYear() + 1, 1, 0)
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            min: 0,
                            stepSize: 1,
                            suggestedMax: 3
                        }
                    }]
                },
                plugins: {
                    datalabels: {
                        font: {
                            size: 10,
                            family: "monospace"
                        },
                        textAlign: 'center',
                        formatter: function (value, context) {
                            let data = context.dataset.data[context.dataIndex];
                            let post = context.dataIndex < context.dataset.data.length ? context.dataset.data[context.dataIndex + 1] : undefined;

                            let text = "";
                            value.beers.forEach(beer => {
                                if (text.length > 0) { text += "\n"; }
                                if (post !== undefined && post.x.getFullYear() - data.x.getFullYear() <= 3) {
                                    if (beer.length >= 15)
                                        text += beer.substring(0, 12) + "...";
                                    else
                                        text += beer;
                                } else {
                                    text += beer;
                                }
                            });
                            return text;
                        },
                        align: function (context) {
                            // console.log(Chart.defaults.global.defaultFontSize);
                            if (context.datasetIndex == 0)
                                return 'bottom';
                            else
                                return 'top';
                        },
                        offset: function (context) {
                            let pre = context.dataIndex > 0 ? context.dataset.data[context.dataIndex - 1] : undefined;
                            let data = context.dataset.data[context.dataIndex];
                            let post_length = context.dataIndex < context.dataset.data.length - 1 ? context.dataset.data[context.dataIndex + 1].beers.length : 0;
                            if (pre !== undefined) {
                                if (data.x.getFullYear() - pre.x.getFullYear() <= 2) {
                                    if (pre.mod === undefined) {
                                        context.dataset.data[context.dataIndex]['mod'] = true;
                                        return 6 + (Chart.defaults.global.defaultFontSize * Math.max(data.beers.length, pre.beers.length, post_length));
                                    }
                                }
                            }
                            return 4;
                        }
                    }
                }
            }
        });
    }

    beerOfTheMonthChart.data = { datasets: datasets };
    beerOfTheMonthChart.options.scales.yAxes[0].ticks.suggestedMax = breweries.length + 1;
    beerOfTheMonthChart.options.scales.yAxes[0].ticks.callback = function (label, index, labels) {
        if (label == 0 || label > breweries.length)
            return '';
        else
            return breweries[label - 1];
    }
    beerOfTheMonthChart.options.tooltips.callbacks.label = function (tooltipItem, data) { return getBeerDate(tooltipItem, data); }
    beerOfTheMonthChart.update();
}

function getBeerDate(tooltipItem, datasets) {
    let year_ = parseInt(tooltipItem.xLabel.split(',')[1]);
    let month_ = tooltipItem.xLabel.split(' ')[0];
    return month_ + ' ' + year_;
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
// used to create a consistent color for each brewery
function a2hex(str) {
    let hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    let hex = Math.abs(hash).toString(16);

    return '#' + hex.slice(0, 6);
}
