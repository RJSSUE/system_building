let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 0.96 * _height;
let padding = {'left': 0.25*width, 'bottom': 0.1*height, 'top': 0.1*height, 'right': 0.1*width};
let data = null;
let data_file = './data/data.json';
let constants = {

};
let stickyNoteTypes = ['stakeholder_category','stakeholder_individual','action','need','event'];
let stickyNoteColors = ['#fcb6d0','#ffdee1','#f8dda9','#b6dcb6','#d23931'];
let stickyNoteCount = {
    'stakeholder_category':0,
    'stakeholder_individual':0,
    'action':0,
    'need':0,
    'event':0
}

let notes,notes_dict,svg,note,text,drag;
let xScale,yScale,colorScale;
function create_note(new_note){
}

function double_click(event, d){
    d3.select(this).remove();
}
function draw(notes) {
    colorScale = d3.scaleOrdinal()
                 .domain(stickyNoteTypes)
                 .range(stickyNoteColors);
    xScale = d3.scaleBand()
                .domain(stickyNoteTypes)
                .range([width*1/3, width])
                .padding(0.3);
    yScale = d3.scaleLinear()
                .domain([0,11])
                .range([height-padding.top,padding.bottom]);
    // notes
    note = d3.select('#stickynotes')
        .selectAll("textarea")
        .data(notes)
        .join("textarea")
        .style("margin-left", s => xScale(s.type)+'px')
        .style("margin-top", s => yScale(s.index)+'px')
        .attr("rows",2)
        .attr("cols",15)
        .style('background-color', s => colorScale(s.type))
        .text(s => s.content)
        .style('color',"white")
        .on("dblclick", double_click);

    drag = d3.drag()
        .on("start", dragstart)
        .on("drag", dragged)
        .on("end",dragend);

    note.call(drag).on("click", click);

    function click(event, d) {
        //d3.select(this).attr("opacity",0.8);
    }

    function dragstart() {
        d3.select(this).classed("user", true);
    }

    function dragged(event, d) {
        d3.select(this)
            .style("margin-left", d.x = event.x+"px")
            .style("margin-top", d.y = event.y+'px');
    }
    function dragend(event, d){
        d3.select(this).attr("opacity",1);
    }


}
function pairing() {
    d3.select('#selector').style('visibility','hidden');
    d3.select('#container').style('visibility','hidden');
    d3.select('#pair')
            .style('visibility','visible')
            .style('left',width*0.1 + 'px')
            .style('top', height*0.3 + 'px');
}
function timeline() {
    d3.select('#pair').style('visibility','hidden');
    d3.select('#timeline')
            .style('visibility','visible')
            .style('left',width*0.1 + 'px')
            .style('top', height*0.5 + 'px');
}
function main() {
    d3.json(data_file).then(function (DATA) {
        data = DATA;
        notes = data.notes;
        for (i in notes){
            stickyNoteCount[notes[i].type] += 1;
        }
        console.log(notes);
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
        d3.select('#notetype').on('change',()=> {
            let new_note = {"type": "","content": "","index": 0};
            let type = document.getElementById("notetype");
            let index = type.selectedIndex;
            /*
            new_note["type"] = type.options[index].value;
            new_note["index"] = stickyNoteCount[new_note["type"]]+1;
            new_note["content"] = document.getElementById("text_on_note").value;
            //userdata.push(new_note);
            notes.push(new_note);
            console.log(new_note);
            console.log(notes);
            */

        })

        d3.select('#create').on('click',()=> {
            let new_note = {"type": "","content": "","index": 0}
            let type = document.getElementById("notetype");
            let index = type.selectedIndex;
            new_note["type"] = type.options[index].value;
            new_note["index"] = stickyNoteCount[new_note["type"]]+1;
            new_note["content"] = document.getElementById("text_on_note").value;
            notes.push(new_note);
            note = d3.select('#stickynotes')
                .selectAll("textarea")
                .data(notes)
                .enter()
                .append("textarea")
                .style("margin-left", width*0.1 + 'px')
                .style("margin-top", height*0.4 + 'px')
                .attr("rows",2)
                .attr("cols",15)
                .style('background-color', colorScale(new_note["type"]))
                .text(new_note["content"])
                .style('color',"white")
                .call(drag).on("click", ()=>{})
                .on("dblclick", double_click);
        })
        d3.select('#next').on("click",()=>{
            var content = JSON.stringify({"notes": notes});
            var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "user.json");
            pairing();
        })
        d3.select('#jump').on("click",()=>{
            timeline();
        })

        draw(notes);
    })
}

main()
