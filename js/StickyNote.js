let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 0.96 * _height;
let padding = {'left': 0.25*width, 'bottom': 0.1*height, 'top': 0.1*height, 'right': 0.1*width};
let data = null;// object parsed from the json file
let data_file = './data/data.json';// data path
let stickyNoteTypes = ['stakeholder','feeling','action','stakeholder_individual','event'];
//stakeholder_individual not in use; need & action combined
let stickyNoteColors = ['#fcb6d0','#ffdee1','#f8dda9','#b6dcb6','#d9f1f1'];
let stickyNoteCount = {
    'stakeholder':0,
    'feeling':0,
    'action':0,
    'event':0,
}
let stickyNoteId = 0;
let nxtbtn = document.getElementById("nextbtn");
let bkbtn = document.getElementById("backbtn");
let donebtn = document.getElementById("donebtn");
let combined = [];
let notes;// initiate as data.notes, stores all the sticky notes
let note;// the html object, d3.select('#stickynotes')
let drag;// d3.drag()
let feelings,stakeholders,actions;// array to be bound with datalist
let xScale,yScale,colorScale,eventxScale,eventyScale;//scales for stickynote layout and event layout
let nextCounter=2;
let backCounter =1;
let _counter = 1;
let flag = 0;
let myOption='stakeholder';
var jsonObj = {};
jsonObj['userid'];
jsonObj['stakeholder'] = new Array();
jsonObj['feeling'] = new Array();
jsonObj['action'] = new Array();

// double click deletion function on the sticky note
function double_click(event, d){
    let r=confirm("Do you want to delete this sticky note?");
    if (r==true){
        d3.select(this)
            .text((s) => {
                //delete the sticky note from "notes" list
                let i = 0;
                notes.map((d)=>{
                    if (d.content==s.content){
                        delete d;
                        return;
                    }
                    else{
                        d.index = i;
                        i += 1;
                        return d;
                    }
                });
                stickyNoteCount[s.type] -= 1;
            })
            .remove();
    }
}

//frontclick function to go foward questions
function clickFunc(event, d, x){
    if (bkbtn.style.visibility === 'hidden') {
        bkbtn.style.visibility = 'visible';
    }

    if (_counter>=3) {

    return;
    }
    else {
    _counter++;

    if (nxtbtn.style.visibility === 'hidden') {
        nxtbtn.style.visibility = 'visible';
    }

    if(_counter==1){
        donebtn.style.visibility = 'hidden';
        let type = 'stakeholder';
        d3.select("#question")
            .text(data.questions[type]);

    }
    if(_counter==2){
        donebtn.style.visibility = 'hidden';
        let type = 'feeling';
        myOption = 'feeling';
        d3.select("#question")
            .text(data.questions[type]);
    }
    else if(_counter==3){
        nxtbtn.style.visibility = 'hidden';
        donebtn.style.visibility = 'visible';
        let type = 'action';
        myOption = 'action';
        d3.select("#question")
            .text(data.questions[type]);
    }
    else if(_counter >3){
        alert("end of questions!");
        // x.style.display = 'none';
        pairing();
    }
    }
}
//backclick function to go back in the questions.
function backClick(event, d){
    if (nxtbtn.style.visibility === 'hidden') {
        nxtbtn.style.visibility = 'visible';
    }
    if (_counter == 1){
        return;
        }
    else{
        _counter--;
    if (bkbtn.style.visibility === 'hidden') {
        bkbtn.style.visibility = 'visible';
    }
    if(_counter==2) {
        donebtn.style.visibility = 'hidden';
        let type = 'feeling';
        myOption = 'feeling';
        d3.select("#question")
            .text(data.questions[type]);

    }
    if(_counter==1){
        donebtn.style.visibility = 'hidden';
        bkbtn.style.visibility = 'hidden';
        let type = 'stakeholder';
        myOption = 'stakeholder';
        d3.select("#question")
            .text(data.questions[type]);
    }
    else if(_counter >3){
        alert("You have reached the beginning of the questions!")
    }
}
}
//function that allows the next page to appear
function doneFunc(event, d){
    flag = 1;
    pairing();
    alert("if you don’t see the next question, please scroll down");
    d3.select("#pair")
        .style("visibility","visible");
    d3.select("#three")
        .classed("active", false)
        .classed("completed", true);
    d3.select("#four")
        .classed("active", true);
}
// draw the predefined sticky notes
function draw(notes) {
    // define scale
    colorScale = d3.scaleOrdinal()
                 .domain(stickyNoteTypes)
                 .range(stickyNoteColors);
    xScale = d3.scaleBand()
                .domain(stickyNoteTypes.slice(0,3))
                .range([width*1/4, width*5/6])
                .padding(0.3);
    yScale = d3.scaleLinear()
                .domain([0,7])
                .range([height*1/8,height*7/8]);
    // notes
    note = d3.select('#stickynotes')
        .selectAll("textarea")
        .data(notes)
        .join("textarea")
        .style("margin-left", s => xScale(s.type)+'px')
        .style("margin-top", s => yScale(s.index)+'px')
        .attr("rows",3)
        .attr("cols",18)
        .attr("id", stickyNoteId)
        .style('background-color', s => colorScale(s.type))
        .text(s => s.content)
        .style('color',"black")
        .on("dblclick", double_click)

    stickyNoteId++;

    // drag to move
    drag = d3.drag()
        .on("drag", dragged)
        .on("end", enddrag);
    note.call(drag).on("click", ()=>{});
    function dragged(event, d) {
        d3.select(this)
            .style("margin-left", d.x = event.x+"px")
            .style("margin-top", d.y = event.y+'px');
     }
     function enddrag(event, d){
        var stickyval;
        stickyval = document.getElementById("stickypos").value ;
        document.getElementById("stickypos").value = stickyval+'-index- '+d.index+'-xcoor- '+event.x+'-ycoor- '+event.y;
     }
}

// combine stakeholder with feeling & action
function pairing() {
    stakeholders = Array.from(
        new Set(
            notes.map( (s) => {
                if (s.type == "stakeholder") return s.content;
                else return;
            }
        ))).sort().filter(d=>{return d});
    d3.select('#stakeholder')
               .selectAll('option')
               .data(stakeholders)
               .enter()
               .append('option')
               .text(d=>d);
    d3.select('#prestakeholder')
           .selectAll('option')
           .data(Object.keys(data.prompts))
           .enter()
           .append('option')
           .text(d=>d);

}
function main() {
    d3.json(data_file).then(function (DATA) {
        data = DATA;
        notes = data.notes;
        for (i in notes){
            stickyNoteCount[notes[i].type] += 1;
        }
        d3.select('#selector')
            .style('left',width*0.1 + 'px')
            .style('top', height*0.1 + 'px');
        // display questions according to type
        d3.select("#notetype")
            .on('change', ()=>{
                let type = document.getElementById("notetype").value;
                d3.select("#question")
                    .text(data.questions[type]);
            })
        // create new sticky notes
        d3.select('#create').on('click',()=> {
            let new_note = {"type": "","content": "","index": 0};
            new_note["type"] = myOption;
            new_note["index"] = stickyNoteCount[new_note["type"]];
            stickyNoteCount[new_note["type"]] += 1;
            new_note["content"] = document.getElementById("text_on_note").value;
            notes.push(new_note);
            note = d3.select('#stickynotes')
                .selectAll("textarea")
                .data(notes)
                .enter()
                .append("textarea")
                .style("margin-left", xScale(new_note["type"])+'px')
                .style("margin-top", yScale(new_note["index"])+'px')
                .attr("rows",3)
                .attr("cols",18)
                .style('background-color', colorScale(new_note["type"]))
                .text(new_note["content"])
                .style('color',"black")
                .call(drag).on("click",()=>{} )
                .on("dblclick", double_click)
                .attr("readonly", true)
                //added readony attribute

                // clear input value
                document.getElementById("text_on_note").value = "";
        })
        d3.select('#prestakeholdertype')
            .on('change',()=>{
             let stakeholder_ = document.getElementById("prestakeholdertype").value;
             if (stakeholder_ in data.prompts){
                 $("#preoutcome").empty();
                 d3.select('#preoutcome')
                    .selectAll('option')
                    .data(data.prompts[stakeholder_])
                    .enter()
                    .append('option')
                    .text(d=>d)
             }
            })
        // create combined sticky notes
        d3.select('#combine').on('click',()=> {
            var url_string = window.location.href
            var url = new URL(url_string);
            var userid = url.searchParams.get("WACC");
            let new_note = {"type": "event","content": "","index": 0}
            new_note["index"] = stickyNoteCount["event"];
            stickyNoteCount["event"] += 1;
            let content = "Stakeholder: "
            content += document.getElementById("stakeholdertype").value;
            content += "\nTo do: "
            content += document.getElementById("outcometype").value;
            new_note["content"] = content;
            notes.push(new_note);
            combined.push(new_note);
            eventxScale = d3.scaleLinear()
                        .domain([0,3])
                        .range([0, width*3/4]);
            eventyScale = d3.scaleLinear()
                        .domain([0,4])
                        .range([height*1/15,height*7/8]);
            d3.select('#events')
                .selectAll("textarea")
                .data(combined)
                .enter()
                .append("textarea")
                .style('background-color', colorScale(new_note["type"]))
                .style('text-align','left')
                .style("margin-left", eventxScale((new_note["index"]%4))+'px')
                .style("margin-top", eventyScale(Math.floor(new_note["index"]/4))+'px')
                .text(new_note["content"])
                .attr("rows",5)
                .attr("cols",25)
                .style('color',"black")
                .call(drag).on("click", ()=>{})
                .on("dblclick", double_click);
            document.getElementById("stakeholdertype").value = "";
            document.getElementById("outcometype").value = "";
        })

        // create combined sticky notes
        d3.select('#combine2').on('click',()=> {
            var url_string = window.location.href
            var url = new URL(url_string);
            var userid = url.searchParams.get("WACC");
            let new_note = {"type": "event","content": "","index": 0}
            new_note["index"] = stickyNoteCount["event"];
            stickyNoteCount["event"] += 1;
            let content = "Stakeholder: "
            content += document.getElementById("prestakeholdertype").value;
            content += "\nTo do: "
            content += document.getElementById("preoutcometype").value;
            new_note["content"] = content;
            notes.push(new_note);
            combined.push(new_note);
            eventxScale = d3.scaleLinear()
                        .domain([0,3])
                        .range([0, width*3/4]);
            eventyScale = d3.scaleLinear()
                        .domain([0,4])
                        .range([height*1/15,height*7/8]);
            d3.select('#events')
                .selectAll("textarea")
                .data(combined)
                .enter()
                .append("textarea")
                .style('background-color', colorScale(new_note["type"]))
                .style('text-align','left')
                .style("margin-left", eventxScale((new_note["index"]%4))+'px')
                .style("margin-top", eventyScale(Math.floor(new_note["index"]/4))+'px')
                .text(new_note["content"])
                .attr("rows",5)
                .attr("cols",25)
                .style('color',"black")
                .call(drag).on("click", ()=>{})
                .on("dblclick", double_click);

            document.getElementById("prestakeholdertype").value = "";
            document.getElementById("preoutcometype").value = "";
        })
        d3.select("#go_to_createnote").on("click",()=>{
            d3.select("#two")
                .classed("active", false)
                .classed("completed", true);
            d3.select("#three")
                .classed("active", true);
            d3.select("#createnotes")
                .style("visibility","visible");
            alert("if you don’t see the next question, please scroll down");
        })
        d3.select('#next').on("click",()=>{
            d3.select("#four")
                .classed("active", false)
                .classed("completed", true);
            d3.select("#five")
                .classed("active", true);
            d3.select("#timelineSection")
                .style("visibility","visible")
                .style("margin-top", eventyScale(Math.floor(stickyNoteCount['event']/4)+1)+'px');
        })
        d3.select('#extend').on("click",()=>{
            d3.select('#timelines')
            .append("HR")
            .attr("width","80%")
            .style("margin-top","130px")
            .style("border","3px solid grey")
        })
        d3.select('#done').on("click",()=>{
            d3.select("#five")
                .classed("active", false)
                .classed("completed", true);
            var content = "Feelings:\n";
            content += document.getElementById("feeling").value;
            content += JSON.stringify({"notes": notes});
            //look here for bolding
            var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "user.json");
        })
        draw(notes);
    })
}
main()