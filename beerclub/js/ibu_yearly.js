function averageIbu(club) {
    // year -> [IBU array]
    ibu_data = {};

    // track each IBU encountered
    for (let year = min_year; year <= max_year; year++) {
        let ibu = [];
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                beers[year][month].forEach(beer => {
                    if (beer['clubs'].includes(club) && beer['Int’l Bittering Units (IBUs)'] != undefined) {
                        if (beer['Int’l Bittering Units (IBUs)'] != "Unknown" &&
                            !beer['Int’l Bittering Units (IBUs)'].includes("Not available") &&
                            beer['Int’l Bittering Units (IBUs)'] != "N/A")
                            ibu.push(parseFloat(beer['Int’l Bittering Units (IBUs)'].replace("~", "")));
                    }
                });
            }
        }
        ibu_data[year] = ibu;
    }

    let data = {
        labels: Array.from({ length: max_year - min_year + 1 }, (_, i) => i + min_year),
        datasets: [
            {
                label: "1st Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => quantile(ibu_data[i + min_year], .25))
            },
            {
                label: "Average IBU",
                backgroundColor: "rgba(255,0,0,1)",
                borderColor: "rgba(255,0,0,0.5)",
                fill: false,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => (ibu_data[i + min_year].reduce((a, b) => a + b, 0) / ibu_data[i + min_year].length).toFixed(2))
            },
            {
                label: "3rd Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => quantile(ibu_data[i + min_year], .75))
            }
        ]
    };
    if (averageIbuChart == undefined) {
        let ctx = document.getElementById('averageIbu').getContext('2d');
        averageIbuChart = new Chart(ctx, {
            type: 'line',
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
        averageIbuChart.data = data;
        averageIbuChart.update();
    }
}