function Histograma(setlists) {
    this.setlists = setlists
    this.songCount = {}
    this.newSongCount = {}
    this.count()
    this.load()
  }

  Histograma.prototype.play = function () {
    console.log(this.songCount);
    for (let s = 0; s < this.songCount.length; s++) {
        this.songCount[s][1] = 0
    }
    console.log(this.songCount);
    this.histoData
    .selectAll('rect.count')
    .data(this.songCount)
    .join('rect')
        .transition()
        .attr('x', 1)
        .attr('y', (d, i) => (this.yScale(i + 1) + 16))
        .attr('width', (d, i) => this.scale(d[1]))
        .attr('height', 15)
        .attr('fill', 'hsl(0 100% 29% / 1)')

this.histoData
    .selectAll('text.names')
    .data(this.songCount)
    .join('text')
        .text((d) => (`${d[0]}`))
        .transition()
        .attr('x', 5)
        .attr('y', (d, i) => this.yScale(i + 1) + 13)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('font-weight', '300')

this.histoData
    .selectAll('text.times')
    .data(this.songCount)
    .join('text')
        .text((d) => d[1])
        .transition()
        .attr('x', (d) => this.scale(d[1]) + 5)
        .attr('y', (d, i) => this.yScale(i + 1) + 28)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('font-weight', '300')
}
  

  Histograma.prototype.addSet = function (setlist) {
    for (let c = 0; c < setlist.sets.set.map(element => element.song).flat().length; c++) {
        const song = setlist.sets.set.map(element => element.song).flat()[c];
        for (let s = 0; s < this.songCount.length; s++) {
            const sn = this.songCount[s];
            console.log(sn);
            if (this.songCount[s][0] == song.name) {
                this.songCount[s][1] += 1
            }
        }
    }
    console.log("PRELOL");
    console.log(this.songCount);
    // var sortable = [];
    // for (var song in this.songCount) {
    //     sortable.push([song, this.songCount[song]]);
    // }
    this.songCount.sort(function(a, b) {
        return -(a[1] - b[1]);
    });
    // this.songCount = sortable;
    console.log("LOL");
    console.log(this.songCount);
    this.histoData
        .selectAll('rect.count')
        .data(this.songCount)
        .join('rect')
            .transition()
            .attr('x', 1)
            .attr('y', (d, i) => (this.yScale(i + 1) + 16))
            .attr('width', (d, i) => this.scale(d[1]))
            .attr('height', 15)
            .attr('fill', 'hsl(0 100% 29% / 1)')

    this.histoData
        .selectAll('text.names')
        .data(this.songCount)
        .join('text')
            .text((d) => (`${d[0]}`))
            .transition()
            .attr('x', 5)
            .attr('y', (d, i) => this.yScale(i + 1) + 13)
            .attr('fill', 'white')
            .attr('font-size', 12)
            .attr('font-weight', '300')

    this.histoData
        .selectAll('text.times')
        .data(this.songCount)
        .join('text')
            .text((d) => d[1])
            .transition()
            .attr('x', (d) => this.scale(d[1]) + 5)
            .attr('y', (d, i) => this.yScale(i + 1) + 28)
            .attr('fill', 'white')
            .attr('font-size', 12)
            .attr('font-weight', '300')
  }

Histograma.prototype.count = function() {
    for (let s = 0; s < this.setlists.length; s++) {
        const setlist = this.setlists[s];
        for (let c = 0; c < setlist.sets.set.map(element => element.song).flat().length; c++) {
            const song = setlist.sets.set.map(element => element.song).flat()[c];
            if (Object.keys(this.songCount).includes(song.name)) {
                this.songCount[song.name] += 1
            } else {
                this.songCount[song.name] = 1
            }
        }
    }
    var sortable = [];
    for (var song in this.songCount) {
        sortable.push([song, this.songCount[song]]);
    }
    sortable.sort(function(a, b) {
        return -(a[1] - b[1]);
    });
    this.songCount = sortable;
    console.log(this.songCount);
    
  }

Histograma.prototype.load = function () {
    var svgWidth = d3.select('#sidebar').node().offsetWidth

    d3.select('#sidebar')
      .html('')
      .append('div')
        .attr('class', 'sidebar-title')
        .style('width', '100%')
        .style('height', '50px')
        .style('vertical-align', 'middle')
        .append("h2")
          .text('Las más tocadas')
          .style("color", "white")
    var svg = d3.select('#sidebar')
      .append('svg')
      .style("width", "96%")
      .style("left", "2%")
      .style("top", "2%")
      .style("height", "87%")
      .style('background-color', 'rgba(0, 0, 0, 0.0)')
    //   .style('border', 'solid')
    //   .style('border-color', 'white')

    var histo = svg.append('g')
        .attr('transform', 'translate(30, 20)')

    this.scale = d3
        .scaleLinear()
        .domain([0, Math.max(...this.songCount.map(el => el[1])) + 50])
        .range([0, svg.node().getBoundingClientRect().width -50]);
    
    var xAxis = d3.axisTop()
        .scale(this.scale)
    
    histo.append('g')
        .classed('histoAxis', true)
        .call(xAxis)

    this.yScale = d3
        .scaleBand()
        .domain(Array.from({length: 142}, (x, i) => i + 1) )
        .range([0, 6000]);
    
    var yAxis = d3.axisLeft()
        .scale(this.yScale)
    
    histo.append('g')
        .classed('histoAxis', true)
        .call(yAxis)
    
    this.histoData = histo.append('g')

    this.histoData
        .selectAll('rect.count')
        .data(this.songCount)
        .join('rect')
            .attr('x', 1)
            .attr('y', (d, i) => (this.yScale(i + 1) + 16))
            .attr('width', (d, i) => this.scale(d[1]))
            .attr('height', 15)
            .attr('fill', (d) => `#${intToRGB(hashCode(d[0]))}`)
    this.histoData
        .selectAll('text.names')
        .data(this.songCount)
        .join('text')
            .text((d) => (`${d[0]}`))
            .attr('x', 5)
            .attr('y', (d, i) => this.yScale(i + 1) + 13)
            .attr('fill', 'white')
            .attr('font-size', 12)
            .attr('font-weight', '300')
    
    this.histoData
        .selectAll('text.times')
        .data(this.songCount)
        .join('text')
            .text((d) => d[1])
            .attr('x', (d) => this.scale(d[1]) + 5)
            .attr('y', (d, i) => this.yScale(i + 1) + 28)
            .attr('fill', 'white')
            .attr('font-size', 12)
            .attr('font-weight', '300')
            
  }