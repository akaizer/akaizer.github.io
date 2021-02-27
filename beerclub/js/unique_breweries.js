function uniqueBreweries(club) {
    // calculate total, unique, and repeat breweries per year
    brewery_data = {}; // year -> {total, unique, repeats}

    // track each brewery encountered
    breweries = new Set();
    for (let year = min_year; year <= max_year; year++) {
        let unique = 0;
        let repeats = 0;
        // go through this year to find the unique breweries encountered
        for (let month_value = 0; month_value < 12; month_value++) {
            let breweries_ = new Set();
            let month = MONTHS[month_value];
            if (month in beers[year]) {
                for (count in beers[year][month]) {
                    let beer = beers[year][month][count];
                    if (beer['clubs'].includes(club)) {
                        breweries_.add(beer['brewery']);
                    }
                }
            }
            breweries_.forEach(brewery => {
                if (breweries.has(brewery)) {
                    repeats += 1;
                } else {
                    unique += 1;
                }
                breweries.add(brewery);
            });
        }
        brewery_data[year] = { 'total': unique + repeats, 'unique': unique, 'repeat': repeats };
    }

    let data = {
        labels: Array.from({ length: max_year - min_year + 1 }, (_, i) => i + min_year),
        datasets: [
            {
                label: "First-Time",
                backgroundColor: "#008000",
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => brewery_data[i + min_year]['unique'])
            },
            {
                label: "Repeat",
                backgroundColor: "#ffd700",
                data: Array.from({ length: max_year - min_year + 1 }, (_, i) => brewery_data[i + min_year]['repeat'])
            }
        ]
    };
    if (uniqueBreweriesChart == undefined) {
        let ctx = document.getElementById('breweryFrequency').getContext('2d');
        uniqueBreweriesChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                barValueSpacing: 20,
                title: {
                    display: true,
                    fontSize: 18,
                    text: "Number of First-Time vs. Repeat Breweries Observed"
                },
                legend: {
                    position: 'bottom'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                        }
                    }]
                }
            }
        });
    } else {
        uniqueBreweriesChart.data = data;
        uniqueBreweriesChart.update();
    }
}