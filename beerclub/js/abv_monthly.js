// Does seasonality have heavier or lighter beers?
function averageAbvMonth(club) {
    // month -> [ABV array]
    abv_data = {};

    // track each ABV encountered
    for (let year = min_year; year <= max_year; year++) {
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (!(month in abv_data)) { abv_data[month] = []; }
            if (month in beers[year]) {
                beers[year][month].forEach(beer => {
                    if (beer['clubs'].includes(club) && beer['Alcohol by Volume'] != undefined) {
                        abv_data[month].push(parseFloat(beer['Alcohol by Volume'].replace("~", "").replace("approx. ", "").replace("approx ", "")));
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
                data: Array.from({ length: 12 }, (_, i) => quantile(abv_data[MONTHS[i]], .25))
            },
            {
                label: "Average ABV",
                backgroundColor: "rgba(255,0,0,1)",
                borderColor: "rgba(255,0,0,0.5)",
                fill: false,
                data: Array.from({ length: 12 }, (_, i) => (abv_data[MONTHS[i]].reduce((a, b) => a + b, 0) / abv_data[MONTHS[i]].length).toFixed(2))
            },
            {
                label: "3rd Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: 12 }, (_, i) => quantile(abv_data[MONTHS[i]], .75))
            }
        ]
    };
    if (averageAbvMonthChart == undefined) {
        let ctx = document.getElementById('averageAbvMonth').getContext('2d');
        averageAbvMonthChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                barValueSpacing: 20,
                title: {
                    display: true,
                    fontSize: 18,
                    text: "ABV Statistics"
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
        averageAbvMonthChart.data = data;
        averageAbvMonthChart.update();
    }
}