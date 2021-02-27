// Does seasonality have more or less bitter beers?
function averageIbuMonth(club) {
    // month -> [IBU array]
    ibu_data = {};

    // track each IBU encountered
    for (let year = min_year; year <= max_year; year++) {
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (!(month in ibu_data)) { ibu_data[month] = []; }
            if (month in beers[year]) {
                beers[year][month].forEach(beer => {
                    if (beer['clubs'].includes(club) && beer['Int’l Bittering Units (IBUs)'] != undefined) {
                        if (beer['Int’l Bittering Units (IBUs)'] != "Unknown" && !beer['Int’l Bittering Units (IBUs)'].includes("Not available") && beer['Int’l Bittering Units (IBUs)'] != "N/A")
                            ibu_data[month].push(parseFloat(beer['Int’l Bittering Units (IBUs)'].replace("~", "")));
                    }
                });
            }
        }
    }

    let data = {
        labels: Array.from({ length: 12 }, (_, i) => MONTHS[i]),
        datasets: [
            {
                label: "1st Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: 12 }, (_, i) => quantile(ibu_data[MONTHS[i]], .25))
            },
            {
                label: "Average IBU",
                backgroundColor: "rgba(255,0,0,1)",
                borderColor: "rgba(255,0,0,0.5)",
                fill: false,
                data: Array.from({ length: 12 }, (_, i) => (ibu_data[MONTHS[i]].reduce((a, b) => a + b, 0) / ibu_data[MONTHS[i]].length).toFixed(2))
            },
            {
                label: "3rd Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: 12 }, (_, i) => quantile(ibu_data[MONTHS[i]], .75))
            }
        ]
    };
    if (averageIbuMonthChart == undefined) {
        let ctx = document.getElementById('averageIbuMonth').getContext('2d');
        averageIbuMonthChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                barValueSpacing: 20,
                title: {
                    display: true,
                    fontSize: 18,
                    text: "IBU Statistics"
                },
                legend: {
                    position: 'bottom'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 4 // minimum amongst all charts, want consistent base
                        }
                    }]
                }
            }
        });
    } else {
        averageIbuMonthChart.data = data;
        averageIbuMonthChart.update();
    }
}