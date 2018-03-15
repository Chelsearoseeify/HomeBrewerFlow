var addButton = document.getElementById("add");
var divideButton = document.getElementById("divide");
var mergeButton = document.getElementById("merge");
var deleteButton = document.getElementById("delete");
var lastCreatedStateId = 1;
var lastCreatedActivityId = 1;
var currentState={
    column:1,
    row:1,
}
var objSelected = {
    id: "id",
    column: 1,
    row: 1
}
var stack = [];

addButton.onclick = function() {
    addActivity();
}

divideButton.onclick = function(){
    splitActivities();

}

mergeButton.onclick = function () {
    mergeActvities();
}

deleteButton.onclick = function (){
   deleteActvity();
}

/*
//estrae i dati dallo stato selezionato
function selectElement(id){
    //var container = document.getElementById("grid-container");
    var obj;
    var style;
    obj = document.getElementById(id);
    objSelected.id = id;
    //obj.style.backgroundColor ="none";
    style = window.getComputedStyle(obj);
    objSelected.column = style.getPropertyValue('grid-column-start');
    objSelected.row = style.getPropertyValue('grid-row-start');
    //container.appendChild(showStateButton(parseInt(objSelected.row), parseInt(objSelected.column)+1));
    //createActivity(id+1,objSelected.row, objSelected.column+1);
}
*/
//inizializza una nuova attività
function createActivity(id, row, column){
    var item;
    item = document.createElement("div");
    item.setAttribute("class", "grid-item-activity");
    item.setAttribute("id", "itemA"+id);
    item.innerText = "A"+id;
    item.style.gridColumn = column +"/ "+column;
    item.style.gridRow = row +"/ "+row;
    return item;
}

function createState(id, row, column, path){
    var item;
    var img;
    item = document.createElement("div");
    item.setAttribute("class", "grid-item-state");
    item.setAttribute("id", "itemS"+id);
    item.setAttribute("onclick", "selectElement(id)");
    item.setAttribute("onmouseover", "highlight(id)");
    item.setAttribute("onmouseleave","unhighlight(id)");
    item.style.gridColumn = column +"/ "+column;
    item.style.gridRow = row +"/ "+row;
    item.style.paddingRight = "5px";
    item.style.paddingLeft = "5px";
    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +id);
    img.style.paddingTop ="5px";

    item.appendChild(img);

    //var button_space = document.getElementById("button-space");
    //button_space.style.gridColumn = column +"/ "+column;
    //button_space.gridRow = row +"/ "+row;
    return item;
}
function addActivity(){
    var container = document.getElementById("grid-container");
    //crea una nuova attività con id incrementato
    lastCreatedActivityId+=1;
    var newActivity = createActivity(lastCreatedActivityId, currentState.row, currentState.column+1);
    //crea un nuovo stato con id incrementato
    lastCreatedStateId+=1;
    var newState = createState(lastCreatedStateId, currentState.row, currentState.column+2,"simbols/arrow.png");

    container.appendChild(newActivity);
    container.appendChild(newState);

    currentState.column+=2;
    stack.push("simple"); //aggiorna lo stack
}

function mergeActvities(){
    if(stack[stack.length-1] === "divide") {
        var container = document.getElementById("grid-container");
        //crea il nuovo stato di merge
        lastCreatedActivityId += 1;
        var newActivity = createActivity(lastCreatedActivityId, currentState.row, currentState.column + 1);
        //modifica img stato merged riga secondaria
        document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow5.png";
        //modifica img stato merged riga principale
        document.getElementById("imgS" + (lastCreatedStateId-1)).src = "simbols/arrow2.png";
        //crea il nuovo stato di merge
        lastCreatedStateId += 1;
        var newState = createState(lastCreatedStateId, currentState.row, currentState.column + 2, "simbols/arrow.png");

        container.appendChild(newActivity);
        container.appendChild(newState);

        currentState.column += 2;
        stack.push("merge"); //aggiorna lo stack
    }
}

function deleteActvity(){
    if(currentState.column>1) {
        var container = document.getElementById("grid-container");
        switch (stack[stack.length-1]){
            case "simple":{
                container.removeChild(container.lastChild);
                lastCreatedStateId -= 1;
                container.removeChild(container.lastChild);
                lastCreatedActivityId -= 1;
                document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow.png";
                currentState.column -= 2;
                stack.pop();
                break;
            }
            case "divide":{
                for (var i = 0; i < 5; i++) {
                    container.removeChild(container.lastChild);
                }
                currentState.column -= 2;
                lastCreatedStateId -= 3;
                lastCreatedActivityId -= 2;
                document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow.png";
                stack.pop();
                break;
            }
            case "merge":{
                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                currentState.column -= 2;
                lastCreatedStateId -= 1;
                lastCreatedActivityId -= 1;
                document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow.png";
                document.getElementById("imgS" + (lastCreatedStateId-1)).src = "simbols/arrow.png";
                stack.pop();
                break;
            }


        }
    }
}

function splitActivities(){
    if(!(stack[stack.length-1] === "merge")) { //se l'ultima azione fatta non è merge
        var container = document.getElementById("grid-container");
        //crea due nuove attività
        lastCreatedActivityId += 1;
        var newActivity1 = createActivity(lastCreatedActivityId, currentState.row, currentState.column + 1);
        lastCreatedActivityId += 1;
        var newActivity2 = createActivity(lastCreatedActivityId, currentState.row + 1, currentState.column + 1);
        //aggiorna img ultimo stato
        document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow2.png";
        //crea tre nuovi stati
        lastCreatedStateId += 1;
        var splitState = createState(lastCreatedStateId, currentState.row + 1, currentState.column, "simbols/arrow3.png");
        //riga principale
        lastCreatedStateId += 1;
        var newState1 = createState(lastCreatedStateId, currentState.row, currentState.column + 2, "simbols/arrow.png");
        //riga secondaria
        lastCreatedStateId += 1;
        var newState2 = createState(lastCreatedStateId, currentState.row + 1, currentState.column + 2, "simbols/arrow.png");

        container.appendChild(newActivity1);
        container.appendChild(newActivity2);
        container.appendChild(splitState);
        container.appendChild(newState1);
        container.appendChild(newState2);

        currentState.column += 2;
        stack.push("divide"); //aggiorna lo stack
    }
}

function highlight(id) {
    var obj;
    var style;
    obj = document.getElementById(id);
    objSelected.id = id;
    //obj.style.backgroundColor = "white";
    //obj.style.borderColor = "red";
    style = window.getComputedStyle(obj);
    objSelected.column = style.getPropertyValue('grid-column-start');
    objSelected.row = style.getPropertyValue('grid-row-start');
    if (document.getElementById("state-button") == null) {
        obj.appendChild(showStateButton(parseInt(objSelected.row), parseInt(objSelected.column) + 1));
    }


}

function showStateButton(row, column){
    var item = document.createElement("div");
    item.setAttribute("id", "state-button");
    item.style.gridColumn = (column+1) +"/ "+(column+1);
    item.style.gridRow = row +"/ "+row;
    item.style.display = "inline-block";
    var buttonSplit = document.createElement("button");
    var buttonMerge = document.createElement("button");
    var splitImg = document.createElement("img");
    var mergeImg = document.createElement("img");
    splitImg.setAttribute("src", "simbols/icon/split.png");
    splitImg.setAttribute("class", "icon");
    mergeImg.setAttribute("src", "simbols/icon/merge.png");
    mergeImg.setAttribute("class", "icon");
    buttonSplit.appendChild(splitImg);
    buttonMerge.appendChild(mergeImg);
    buttonSplit.setAttribute("onclick", "splitActivities()");
    buttonSplit.setAttribute("class", "button");
    buttonMerge.setAttribute("onclick", "mergeActvities()");
    buttonMerge.setAttribute("class", "button");
    item.appendChild(buttonSplit);
    item.appendChild(buttonMerge);
    return item;

}

function unhighlight(id){
    var obj;
    obj = document.getElementById(id);
    objSelected.id = id;
    obj.style.background = "none";
    obj.removeChild(document.getElementById("state-button"));

}
