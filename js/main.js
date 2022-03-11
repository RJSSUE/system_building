let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 0.96 * _height;
let padding = {'left': 0.25*width, 'bottom': 0.1*height, 'top': 0.2*height, 'right': 0.1*width};
let data = null;
let data_file = './data/data.json';
let constants = {

};
let stickyNoteTypes = ['stakeholder_category','stakeholder_individual','action','need','event'];
let stickyNoteColors = ['#fcb6d0','#ffdee1','#f8dda9','#d23931','#b6dcb6'];
let stickyNoteCount = {
    'stakeholder_category':0,
    'stakeholder_individual':0,
    'action':0,
    'need':0,
    'event':0
}

let notes,notes_dict,svg,note,text;
let xScale,yScale,colorScale;
function get_input() {

}
function create(before_start = () => {}) {

}

function clamp(x, lo, hi) {
    return x < lo ? lo : x > hi ? hi : x;
}

function draw() {
    notes = data.notes;
    notes_cnt = {};
    colorScale = d3.scaleOrdinal()
                     .domain(stickyNoteTypes)
                     .range(stickyNoteColors);
    xScale = d3.scaleBand()
                .domain(stickyNoteTypes)
                .range([width*2/3, width])
                .padding(0.3);
    yScale = d3.scaleLinear()
                .domain([0,11])
                .range([height-padding.bottom,height/2]);
    // notes
    note = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .selectAll("rect")
            .data(notes)
            .join("rect")
            .attr("x", s => xScale(s.type))
            .attr("y", s => yScale(s.index))
            .attr("width",xScale.bandwidth())
            .attr("height",20)
            .attr('fill', s => colorScale(s.type))
            .text(s => s.content)
            .attr("opacity",0.8)
            .classed("note", true);

    const drag = d3.drag()
        .on("start", dragstart)
        .on("drag", dragged)
        .on("end",dragend);

    note.call(drag).on("click", click);

    function click(event, d) {
        delete d.fx;
        delete d.fy;
        d3.select(this)
            .classed("fixed", false);
        draw_and_calc();
    }

    function dragstart() {
        d3.select(this).classed("fixed", true);
    }

    function dragged(event, d) {
        d3.select(this)
            .attr("x",d.x = event.x)
            .attr("y",d.y = event.y)
            .attr('opacity',0.8);
    }
    function dragend(event, d){
        d.fx = true;
        d.fy = true;
    }
}

function main() {
    d3.json(data_file).then(function (DATA) {
        svg = d3.select('#container')
            .select('svg')
            .attr('width', width)
            .attr('height', height);
        svg.append('g')
            .attr('transform', `translate(${width*0.55}, ${height*0.1})`)
            .append('text')
            .attr('class', 'title')
            .text('A sense-making platform to help address online harm');
        d3.select('#selector')
            .style('left',width*0.1 + 'px')
            .style('top', height*0.1 + 'px')
            .style('visibility', 'visible');
        d3.select('#create')
            .on('click',()=>{
                create(get_input);
            });
        data = DATA;
        draw();
    })
}

main()

