function countVisits (geoData, data) {
  var visits = {}
  for (let k = 0; k < geoData.features.length; k++) {
    const country = geoData.features[k];
    visits[country.properties.name] = 0
  }
  for (let i = 0; i < data.length; i++) {
    const setlist = data[i];
    if (Object.keys(visits).includes(setlist.venue.city.country.name)) {
      visits[setlist.venue.city.country.name]++;
    }
  }
  return visits;
}

function viewSetlist(setlists, setId, setlistTotal, cityId, back=false) {
  var show = setlists.find((setlist) => setlist.id === setId);
  d3.select('#sidebar')
    .html('')
    .append('div')
      .attr('class', 'sidebar-title')
      .style('width', '100%')
      .style('vertical-align', 'middle')
      .append("h2")
        .text(`${show.venue.name}`)
        .style("color", "white")
  d3.select('.sidebar-title')
    .append("h3")
      .text(`${show.eventDate}`)
  d3.select('.sidebar-title')
    .append("h4")
      .text(`${show.venue.city.name}, ${show.venue.city.country.name}`)
  if (show.tour?.name) {
    d3.select('.sidebar-title')
      .append("h4")
        .text(`Tour: ${show.tour.name}`)
  }
  if (show.info) {
    d3.select('.sidebar-title')
      .append("p")
        .text(`${show.venue.name}`)
  }
  d3.select('#sidebar')
      .append("hl")

  d3.select('#sidebar')
    .append('div')
    .attr('class', 'show')
    .style('padding-top', '35px')
    .style('overflow', 'visible')
    .selectAll('div')
    .data(show.sets.set.map(element => element.song).flat())
    .join('div')
      .style('width', '100%')
      .style('vertical-align', 'middle')
      .on('mouseover', function (e) {
        this.style.backgroundColor = "#ff000091"
      })
      .on('mouseout', function (e) {
        this.style.backgroundColor = ''
      })
      .append('p')
        .style('text-align', 'left')
        .style('margin', 5)
        .style('margin-left', 35)
        .style('vertical-align', 'middle')
        .text((d, i) => (`${i + 1}. ${d.name}`))
          .style('color', 'white')
  if (back) {
    d3.select('#sidebar')
    .append('div')
    .style('width', '50px')
    .style('height', '50px')
    .style('position', 'absolute')
    .style('left', 0)
    .style('top', 0)
    .append('h2')
      .text('<')
      .style('color', 'white')
      .style('font-family', 'monospace')
      .style('font-size', '50')
      .style('margin-top', '0')
      .on('mouseover', function (e) {
        d3.select(this)
          .style('cursor', 'pointer')
          .style('-webkit-text-stroke', '1px white')
          .style('color', 'red')
      })
      .on('mouseout', function (e) {
        d3.select(this)
          .style('color', 'white')
      })
      .on('click', function (e) {
        loadSideBar(setlistTotal, cityId)
      })
  }
}

function loadSideBar(setlistsTotal, cityId) {
  setlists = setlistsTotal.filter(setlist => setlist.venue.city.id == cityId);
  d3.select('#sidebar')
    .html('')
    .append('div')
      .attr('class', 'sidebar-title')
      .style('width', '100%')
      .style('height', '50px')
      .style('vertical-align', 'middle')
      .append("h2")
        .text(`${setlists[0].venue.city.name}, ${setlists[0].venue.city.country.name}`)
        .style("color", "white")
        // .style("font-size", "1.5em")
  
  d3.select('#sidebar')
    .append('div')
    .attr('class', 'shows')
    .style('overflow', 'visible')
    .selectAll('div')
    .data(setlists)
    .join('div')
      .style('width', '100%')
      .style('height', '25px')
      .style('vertical-align', 'middle')
      .style('padding-top', '6px')
      .on('mouseover', function (e) {
        this.style.backgroundColor = "#ff000091"
      })
      .on('mouseout', function (e) {
        this.style.backgroundColor = ''
      })
      .on('click', (e, d) => viewSetlist(setlists, d.id, setlistsTotal, cityId, back=true))
      .append('p')
        .style('margin', 0)
        .style('vertical-align', 'middle')
        .text((d) => (`${d.venue.name}, ${d.eventDate}`))
          .style('color', 'white')

}

function dateTransform(dateString) {
  dateString = dateString.split('-')
  return new Date(`${dateString[2]}-${dateString[1]}-${dateString[0]}`)
}

function loadTimeline(setlists, lim=false) {
  const svgHeight = d3.select('#timeline').node().clientHeight;
  const svgWidth = d3.select('#timeline').node().clientWidth;
  
  var tours = {};
  for (let i = 0; i < setlists.length; i++) {
    const show = setlists[i];
    if (!Object.keys(tours).includes(show.tour?.name)) {
      tours[show.tour?.name] = {}
      tours[show.tour?.name].firstShow = dateTransform(show.eventDate)
    } else {
      tours[show.tour?.name].lastShow = dateTransform(show.eventDate)
    }
  }
  console.log(tours);
  delete tours[undefined]
  const container = d3
    .select('#timeline')
    .html('')
    .append("g")
    .attr("transform", `translate(${svgWidth * 0.02}, ${svgHeight/2})`)
  
  const timeline = container
    .append("g")
  
  const hLine = timeline.append("g")
  
  hLine
    .append('line')
      .attr("id", "tLine")
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', svgWidth * 0.96)
      .attr('y2', 0)
      .attr('stroke-width', 1)
      .attr('stroke', 'white')
  
  var timeScale = d3
    .scaleTime()
    .domain([
      new Date((parseInt(setlists[0].eventDate.slice(-4))) + '-01-01'),
      new Date((parseInt(setlists[setlists.length - 1].eventDate.slice(-4)) + 1) + '-01-01')
    ])
    .range([0, svgWidth * 0.96])
  
  const ticks = timeline.append("g")

  ticks
    .selectAll('line')
    .data(function(){
      var years = [];
      for (let i = (setlists[0].eventDate.slice(-4)); i < (parseInt(setlists[setlists.length - 1].eventDate.slice(-4)) + 2); i++) {
        years.push(new Date(`${i}-01-01`))
      }
      return years
    }())
    .join('line')
      .attr('x1',(d) => timeScale(d))
      .attr('y1', 10)
      .attr('x2',(d) => timeScale(d))
      .attr('y2', -10)
      .attr('stroke', 'white')
  
  ticks
    .selectAll('text')
    .data(function(){
      var years = [];
      for (let i = parseInt(setlists[0].eventDate.slice(-4)); i < (parseInt(setlists[setlists.length - 1].eventDate.slice(-4)) + 2); i++) {
        years.push(new Date(`${i}-01-01`))
      }
      return years
    }())
    .join('text')
      .attr('x',(d) => timeScale(d) - 10)
      .attr('y', 25)
      .attr('stroke', 'white')
      .text((d) => (d.getYear() + 1901))
      .attr('font-size', '10px')
      .attr('font-weight','100')
      .attr('lengthAdjust', 'spacingAndGlyphs')
      .attr('textLength', '25')


      const hticks = timeline.append("g")

      hticks
        .selectAll('line')
        .data(function(){
          var months = [];
          for (let i = (setlists[0].eventDate.slice(-4)); i < (parseInt(setlists[setlists.length - 1].eventDate.slice(-4)) + 2); i++) {
            for (let m = 2; m < 13; m++) {
              if (m.toString().length == 2) {
                months.push(new Date(`${i}-${m}-01`))
              } else {
                months.push(new Date(`${i}-0${m}-01`))
              }
            }
            
          }
          return months
        }())
        .join('line')
          .attr('x1',(d) => timeScale(d))
          .attr('y1', 15)
          .attr('x2',(d) => timeScale(d))
          .attr('y2', 0)
          .attr('stroke', 'white')
          .attr('stroke-width', 0)
      
      hticks
        .selectAll('text')
        .data(function(){
          var months = [];
          for (let i = (setlists[0].eventDate.slice(-4)); i < (parseInt(setlists[setlists.length - 1].eventDate.slice(-4)) + 2); i++) {
            for (let m = 2; m < 13; m++) {
              if (m.toString().length == 2) {
                months.push(new Date(`${i}-${m}-01`))
              } else {
                months.push(new Date(`${i}-0${m}-01`))
              }
            }
            
          }
          return months
        }())
        .join('text')
          .attr('x',(d) => timeScale(d) - 10)
          .attr('y', 25)
          .attr('stroke', 'white')
          .text((d) => (`${[
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
          ][d.getMonth()]}/${d.getFullYear()}`))
          .attr('font-size', '10px')
          .attr('font-weight','100')
          .attr('lengthAdjust', 'spacingAndGlyphs')
          .attr('firstLength', function (d) {
            var bbox = d3.select(this).node().getBBox();
            var width = bbox.width;
            return width
          })
          .attr('visibility', 'hidden')


  
  const tlPoints = timeline.append("g")

  tlPoints
    .selectAll('line')
    .data(setlists)
    .join('line')
      .attr('class', (d) => `lineSet city${d.venue.city.id}`)
      .attr('id',(d) => (`line${d.id}`))
      .attr("x1", (d) => timeScale(dateTransform(d.eventDate)))
      .attr("x2", (d) => timeScale(dateTransform(d.eventDate)))
      .attr("y1", -10)
      .attr("y2", 10)
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr('opacity', 0.7)
      .attr('oriWidth', 1)
      .on("mouseover", function(e, d) {
        d3.select(`#circle${d.venue.city.id}`)
          .attr("fill", 'yellow')
        d3.select(this)
          .attr("stroke", 'yellow')
          .attr("stroke-width", function () {
            return 3/parseFloat(d3.select(this).attr('oriWidth'))
          })
      })
      .on("mouseout", function(e, d) {
        d3.select(`#circle${d.venue.city.id}`)
          .attr("fill", 'red')
        d3.select(this)
          .attr("stroke", 'red')
          .attr("stroke-width", function () {
            return 1/parseFloat(d3.select(this).attr('oriWidth'))
          })
      })
      .on('click', (e, d) => viewSetlist(setlists, d.id))

  
  const tourGroups = timeline.append("g")

  var tourSel = tourGroups
      .selectAll('g')
      .data(Object.keys(tours).map((key) => [key, tours[key]]))
      .join('g')
  
  tourSel
    .append('line')
    .classed('vlineTour', true)
    .classed('tourDrawing', true)
    .attr('x1', (d) => timeScale(d[1].firstShow))
    .attr('y1', function (d, i) {
      if (i%2 != 0) {
        return -25
      } else {
        return -40
      }
    })
    .attr('x2', (d) => timeScale(d[1].firstShow))
    .attr('y2', 0)
    .attr('stroke', 'white')
  
  tourSel
    .append('line')
    .classed('vlineTour', true)
    .classed('tourDrawing', true)
    .attr('x1', (d) => timeScale(d[1].lastShow))
    .attr('y1', -15)
    .attr('x2', (d) => timeScale(d[1].lastShow))
    .attr('y2', 0)
    .attr('stroke', 'white')
  
  tourSel
    .append('line')
    .classed('tourDrawing', true)
    .attr('x1', (d) => timeScale(d[1].firstShow))
    .attr('y1', -15)
    .attr('x2', (d) => timeScale(d[1].lastShow))
    .attr('y2', -15)
    .attr('stroke', 'white')
    
  tourSel
    .append('text')
    .classed('tourDrawing', true)
    .attr('x', (d) => timeScale(d[1].firstShow) + 3)
    .attr('y', function (d, i) {
      if (i%2 != 0) {
        return -18
      } else {
        return -33
      }
    })
    .attr('stroke', 'white')
    .text((d) => (d[0]))
      .style('font-size', 10)
      .style('font-weight', 100)
      .attr('lengthAdjust', 'spacingAndGlyphs')
      .attr('firstLength', function (d) {
        var bbox = d3.select(this).node().getBBox();
        var width = bbox.width;
        return width
      })

      
  
  
      


  
  window.zoomTL = d3
    .zoom()
    .scaleExtent([1, 100])
    .on('zoom', (e) => {
      if (window.zoomable){
      var transform = e.transform;
      console.log(transform.k);
      var transformString = 'translate(' + transform.x + ',' + `${svgHeight/2}` + ') scale(' + transform.k + ',1)';
      container.attr("transform", transformString)
      tlPoints
        .selectAll('line')
          .attr('stroke-width', 1/(e.transform.k**(1/1.5)))
          .attr('oriWidth', (e.transform.k**(1/1.5)))
      ticks
        .selectAll('line')
        .attr('stroke-width', 1/(e.transform.k))
      tourGroups
        .selectAll('.vlineTour')
        .attr('stroke-width', 1/(e.transform.k))
      ticks
        .selectAll('text')
        .attr('textLength', function (d, i, el) {
          var cur_length = d3.select(this)
            .attr('textLength')
          console.log(cur_length, e.transform.k);
          return 25/(e.transform.k)
        })
        .attr('x', (d) => timeScale(d) - (10/e.transform.k))
      tourSel
        .selectAll('text')
        .attr('textLength', function (d, i, el) {
          console.log(d3.select(this).attr('firstLength'));
          return parseFloat(d3.select(this).attr('firstLength'))/(e.transform.k)
        })

        
      tourSel
        .selectAll('text')
        .attr('textLength', function (d, i, el) {
          console.log(d3.select(this).attr('firstLength'));
          return parseFloat(d3.select(this).attr('firstLength'))/(e.transform.k)
        })
      if (e.transform.k > 10) {
        hticks
        .selectAll('line')
        .attr('stroke-width', 1/(e.transform.k))
        hticks
        .selectAll('text')
        .attr('textLength', function (d, i, el) {
          console.log(d3.select(this).attr('firstLength'));
          return parseFloat(d3.select(this).attr('firstLength'))/(e.transform.k)
        })
        .attr('x', (d) => timeScale(d) - (10/e.transform.k))
        .attr('visibility', 'visible')
      } else {
        hticks
        .selectAll('line')
        .attr('stroke-width', 0)
        hticks
        .selectAll('text')
        .attr('textLength', 0)
        .attr('x', (d) => timeScale(d) - (10/e.transform.k))
        .attr('visibility', 'hidden')
      }
      
    }})
  
  d3.select('#timeline').call(zoomTL);

  
}

// When no echabas de menos a tu amiga la recursion
function play(setlists, currentIndex=0, speed=8, zoomardo) {
  
  // Antes de empezar
  if (currentIndex == 0){
    console.log("ID: " + currentIndex);
    d3
    .select("#graph")
          .call(
            zoomardo.transform,
            d3.zoomIdentity
              .translate(d3
                .select("#graph").attr("width") / 2, d3
                .select("#graph").attr("height") / 2))
    
    d3
      .select("#timeline")
          .call(
            window.zoomTL.transform,
            d3.zoomIdentity
              .translate(20, 0))
    window.zoomable = false
    d3.select('#graph')
    .selectAll('circle')
    .transition()
    .attr('r', 0)
    
  d3.select('#timeline')
    .selectAll('.lineSet')
    .transition()
    .attr('stroke-width', 0)

  // d3.select('#timeline')
  //   .selectAll('.tourDrawing')
  //   .attr('stroke-width', 0)
    
  // histo.play()
  // histo.addSet(setlists[currentIndex])
    var histo = new Histograma(setlists.slice(0 ,currentIndex+1))
  }
  var pastIndex = currentIndex - 1
  if (setlists[pastIndex]) {
    d3.select(`#line${setlists[pastIndex].id}`)
    .transition()
    .attr('stroke-width', 1)
    .attr('stroke', 'red')
    .attr('opacity', 0.7)
  d3.select(`#circle${setlists[pastIndex].venue.city.id}`)
    .transition()
    .attr('r', () => {
      currentCount = parseInt(d3.select(`#circle${setlists[pastIndex].venue.city.id}`).attr('count'))
      if (!currentCount) {
        d3.select(`#circle${setlists[pastIndex].venue.city.id}`).attr('count', 1)
        return rScale(1)
      } else {
        d3.select(`#circle${setlists[pastIndex].venue.city.id}`).attr('count', currentCount + 1)
        return rScale(currentCount + 1)
      }
    })
    .attr('opacity', 0.7)
    .attr('fill', 'red')
  }
  
  // Acciones en el actual
  d3.select(`#line${setlists[currentIndex].id}`)
    .attr('stroke-width', 5)
    .attr('stroke', 'yellow')
    .attr('opacity', 1)
  d3.select(`#circle${setlists[currentIndex].venue.city.id}`)
    .attr('r', 15)
    .attr('fill', 'yellow')
    .attr('opacity', 1)

    var histo = new Histograma(setlists.slice(0 ,currentIndex+1))
  // Condicion de termino
  if ((currentIndex < setlists.length-1) && playState == true) {
    setTimeout(function() {
      play(setlists, currentIndex+1)
    }, 500/speed)
  } else {
    AMgraph(HEIGHT, WIDTH, MARGIN)
  }
}

const AMgraph = async (height, width, margin) => {
    const svg = d3
    .select("#graph")
    .html('')
    .append("svg")
        .attr("width", width)
        .attr("height", height)

    const container = svg
    .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const countries = container.append("g")
    const points = container.append("g")
    const geoData = await d3.json("../data/world.geo.json")
    console.log(geoData);
    const amSetlists = await d3.json("../data/boseClean.json")
    const setlistVenues = await d3.json("../data/venuesBose.json")


    // const setlistVenues = await d3.json("../data/venues.json")
    // const amSetlists = await d3.json("../data/clean_setlist.json")

    // const setlistVenues = await d3.json("../data/venuesCharlyGarcia.json")
    // const amSetlists = await d3.json("../data/charlyGarciaClean.json")

    var maxShows = Math.max.apply(Math, Object.values(setlistVenues).map(function(o) { return o.count; }))
    console.log(maxShows);

    var fillScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateReds)
      .domain([-6, maxShows])

    window.rScale = d3
      .scaleLinear()
      .domain([0, maxShows])
      .range([3, 20]);

    const geoScale = d3
    .geoMercator()
    .fitSize(
      [width - margin.left - margin.right, height - margin.top - margin.bottom], 
      geoData
    );

    const geoPaths = d3.geoPath().projection(geoScale);

    geoData.features.forEach(feature => {

    })
    window.zoomable = true
    const zoom = d3
      .zoom()
      .scaleExtent([1, 300])
      .on('zoom', (e) => {
        if (window.zoomable){
        container.attr("transform", e.transform)
        d3.selectAll("circle")
          .data(Object.keys(setlistVenues).map((key) => [key, setlistVenues[key]]))
          .join("circle")
            .attr("r", (d) => rScale(d[1].count)/(e.transform.k**(1/1.3) ))
            .attr("stroke-width", 0.1/e.transform.k)
        // d3.selectAll("circle")
        //   .attr("r", 3/(e.transform.k**(1/1.5) ))
        //   .attr("stroke-width", 0.1/e.transform.k)
        console.log(e);
        d3.selectAll(".allCountries")
          .attr("stroke-width", 0.5/e.transform.k**(1/1.5))}
      })

    svg.call(zoom);

    const clicked = (event, d) => {
      const [[x0, y0], [x1, y1]] = geoPaths.bounds(d);
      svg
        .transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(width / 2 - 300, height / 2 - 100)
              .scale(Math.min(100, 0.7 / Math.max(((x1 - x0) / width), (y1 - y0) / height)))
              .translate((-(x0 + x1) / 2), (-(y0 + y1) / 2)),
            d3.pointer(event, svg.node())
      );
    }

    countries
        .selectAll("path")
        .data(geoData.features)
        .join("path")
            .attr("d", geoPaths)
            .attr("fill", "grey")
            .attr("stroke", "white")
            .attr("stroke-width", "0.2")
            .attr("class", "allCountries")
        .on("click", function(e, d) {
          // d3.selectAll('.allCountries').attr("fill", "black")
          // d3.select(this).attr("fill", "#000f5c")
          clicked(e, d);
        })
        

    // points
    //   .selectAll("circle")
    //   .data(Object.keys(setlistVenues).map((key) => [key, setlistVenues[key]]))
    //   .join("circle")
    //     .attr("cx", (d) => geoScale([amSetlists.find(el => el.venue.id == d[0]).venue.city.coords.long, amSetlists.find(el => el.venue.id == d[0]).venue.city.coords.lat])[0])
    //     .attr("cy", (d) => geoScale([amSetlists.find(el => el.venue.id == d[0]).venue.city.coords.long, amSetlists.find(el => el.venue.id == d[0]).venue.city.coords.lat])[1])
    //     .attr("r", 3)
    //     .attr("fill", (d) => fillScale(d[1]))
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 0.1)

    points
      .selectAll("circle")
      .data(Object.keys(setlistVenues).map((key) => [key, setlistVenues[key]]))
      .join("circle")
        .attr('id', (d) => (`circle${d[0]}`))
        .attr("cx", (d) => geoScale([d[1].long, d[1].lat])[0])
        .attr("cy", (d) => geoScale([d[1].long, d[1].lat])[1])
        .attr("r", (d) => rScale(d[1].count))
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("stroke-width", 0.1)
        .attr("opacity", 0.7)
      .on("mouseover", function(e, d){
        d3.select(this).attr("fill", 'yellow')
        d3.selectAll(`.city${d[0]}`)
          .attr("stroke", 'yellow')
          .attr('y1', '-13')
          .attr('y2', '13')
          .attr("stroke-width", 5/parseFloat(d3.select(`.city${d[0]}`).attr('oriWidth')))
      })
      .on("mouseout", function(e, d){
        d3.select(this).attr("fill",'red')
        d3.selectAll(`.city${d[0]}`)
          .attr("stroke", 'red')
          .attr('y1', '-10')
          .attr('y2', '10')
          .attr("stroke-width", 1/parseFloat(d3.select(`.city${d[0]}`).attr('oriWidth')))
      })
      .on("click", (e, d) => loadSideBar(amSetlists, d[0]))

  loadTimeline(amSetlists)
  var histo = new Histograma(amSetlists)
  d3.select('#play-button')
    .on('click', function(d) {
      if (!window.playState){
        d3.select('#play-button')
          .html('▀')
          .style('font-size', '2.5em')
          .style('padding-top', 18)

        window.playState = true
        play(setlists=amSetlists, currentIndex=0, speed=8, zoomardo=zoom)
      } else {
        d3.select('#play-button')
          .html('►')
          .style('font-size', '32px')
          .style('padding-top', 0)
        window.playState = false
      }
      
    })
}

const WIDTH = document.getElementsByTagName('body')[0].offsetWidth;
const HEIGHT = document.getElementsByTagName('body')[0].offsetHeight;
const MARGIN = {
  top: 0,
  left: 0,
  right: 500,
  bottom: 200,
}

AMgraph(HEIGHT, WIDTH, MARGIN)