function averageAbvBoxPlot(club) {
    // calculate total, unique, and repeat breweries per year
    abv_data = {}; // year -> [ABV array]

    // track each brewery encountered
    for (let year = min_year; year <= max_year; year++) {
        abv = [];
        // go through this year to find the unique breweries encountered
        for (let month_value = 0; month_value < 12; month_value++) {
            let breweries_ = new Set();
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                for (count in beers[year][month]) {
                    let beer = beers[year][month][count];
                    if (beer['clubs'].includes(club) && beer['Alcohol by Volume'] != undefined) {
                        abv.push(parseFloat(beer['Alcohol by Volume'].replace("~", "").replace("approx. ", "").replace("approx ", "")));
                    }
                }
            }
        }
        abv_data[year] = abv;
    }

    let data = {
        labels: Array.from({ length: max_year - min_year + 1 }, (_, i) => i + min_year),
        datasets: [
            {
                label: "ABV",
                backgroundColor: "#ff0000",
                borderColor: "#000000",
                outlierColor: "#999999",
                itemRadius: 0,
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => {
                    const values = abv_data[i + min_year].sort((a, b) => a - b);
                    console.log(values);
                    return abv_data[i + min_year];
                })
            }
        ]
    };
    if (averageAbvChart == undefined) {
        let ctx = document.getElementById('averageAbv').getContext('2d');
        averageAbvChart = new Chart(ctx, {
            type: 'horizontalBoxplot',
            data: data,
            options: {
                barValueSpacing: 20,
                title: {
                    display: true,
                    fontSize: 18,
                    text: "ABV Boxplot"
                },
                legend: {
                    display: false
                }
            }
        });
    } else {
        averageAbvChart.data = data;
        averageAbvChart.update();
    }
}