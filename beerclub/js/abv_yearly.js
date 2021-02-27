function averageAbv(club) {
    // year -> [ABV array]
    abv_data = {};

    // track each ABV encountered
    for (let year = min_year; year <= max_year; year++) {
        abv = [];
        for (let month_value = 0; month_value < 12; month_value++) {
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                beers[year][month].forEach(beer => {
                    if (beer['clubs'].includes(club) && beer['Alcohol by Volume'] != undefined) {
                        abv.push(parseFloat(beer['Alcohol by Volume'].replace("~", "").replace("approx. ", "").replace("approx ", "")));
                    }
                });
            }
        }
        abv_data[year] = abv;
    }

    let data = {
        labels: Array.from({ length: max_year - min_year + 1 }, (_, i) => i + min_year),
        datasets: [
            {
                label: "1st Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => quantile(abv_data[i + min_year], .25))
            },
            {
                label: "Average ABV",
                backgroundColor: "rgba(255,0,0,1)",
                borderColor: "rgba(255,0,0,0.5)",
                fill: false,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => (abv_data[i + min_year].reduce((a, b) => a + b, 0) / abv_data[i + min_year].length).toFixed(2))
            },
            {
                label: "3rd Quartile",
                backgroundColor: "rgba(128,86,0,0.75)",
                borderColor: "rgba(128,86,0,0.15)",
                fill: false,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => quantile(abv_data[i + min_year], .75))
            }
        ]
    };
    if (averageAbvChart == undefined) {
        let ctx = document.getElementById('averageAbv').getContext('2d');
        averageAbvChart = new Chart(ctx, {
            type: 'line',
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
        averageAbvChart.data = data;
        averageAbvChart.update();
    }
}