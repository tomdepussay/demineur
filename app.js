let table = document.querySelector("table");
let reset = document.querySelector("#reset");
let select = document.getElementById('mod');
let timer = document.getElementById('time');

let cell_size = 50;
let grid_size_x = 9;
let grid_size_y = 9;
let grid = [];
let grid_number = [];
let bomb = 10;
let bomb_count = bomb;
let first = false;
let game_over = false;
let game_win = false;
let startTime;
let timerInterval;
let flag = [];

select.addEventListener('change', function(){
    resetFunction();
    createGrid();
});

function createGrid(){

    if(select.value == "easy"){
        cell_size = 50;
        grid_size_x = 9;
        grid_size_y = 9;
        bomb = 10;
        bomb_count = bomb;
    }

    if(select.value == "medium"){
        cell_size = 40;
        grid_size_x = 16;
        grid_size_y = 16;
        bomb = 40;
        bomb_count = bomb;
    }

    if(select.value == "hard"){
        cell_size = 30;
        grid_size_x = 16;
        grid_size_y = 30;
        bomb = 99;
        bomb_count = bomb;
    }
    document.getElementById('counter').innerHTML = bomb;
    document.getElementById('counter-all').innerHTML = bomb;
    
    for(let i = 0; i < grid_size_x; i++){

        let row = document.createElement("tr");
        grid.push([]);
        grid_number.push([]);

        for(let j = 0; j < grid_size_y; j++){

            let cell = document.createElement("td");

            cell.id = i + "_" + j;
            cell.style.width = cell_size + "px";
            cell.style.height = cell_size + "px";
            cell.classList.add("cell");
            cell.addEventListener("click", function(){
                clickCell(cell);
            });
            cell.addEventListener("contextmenu", function(e){
                e.preventDefault();
                rightClick(cell);
            });
            grid[i].push(cell);
            grid_number[i].push(0);
            row.appendChild(cell);

        }

        table.appendChild(row);
    }

    table.style.width = (cell_size * grid_size_y) + "px";
    table.style.height = (cell_size * grid_size_x) + "px";
}

function getCoordinates(cell){
    return {x: parseInt(cell.id.split("_")[0]), y: parseInt(cell.id.split("_")[1])}
}

function createBomb(cell){

    first = true;

    let safe = [];

    let {x, y} = getCoordinates(cell);

    safe.push(grid[x][y])
    
    if((x - 1) >= 0 && (y - 1) >= 0){
        safe.push(grid[x - 1][y - 1]);
    }

    if((x - 1) >= 0){
        safe.push(grid[x - 1][y]);
    }
    
    if((x - 1) >= 0 && (y + 1) < grid_size_y){
        safe.push(grid[x - 1][y + 1]);
    }

    if((y - 1) >= 0){
        safe.push(grid[x][y - 1]);
    }

    if((y + 1) < grid_size_y){
        safe.push(grid[x][y + 1]);
    }

    if((x + 1) < grid_size_x && (y - 1) >= 0){
        safe.push(grid[x + 1][y - 1]);
    }

    if((x + 1) < grid_size_x){
        safe.push(grid[x + 1][y]);
    }

    if((x + 1) < grid_size_x && (y + 1) < grid_size_y){
        safe.push(grid[x + 1][y + 1]);
    }

    let bomb_possible = [];

    for(let i = 0; i < grid_size_x; i++){
        for(let j = 0; j < grid_size_y; j++){
            if(!safe.includes(grid[i][j])){
                bomb_possible.push(grid[i][j]);
            }
        }
    }

    for(let i = 0; i < bomb; i++){
        
        let random = Math.floor(Math.random() * bomb_possible.length);
        let {x, y} = getCoordinates(bomb_possible[random]);
        grid[x][y].classList.add("bomb");
        grid_number[x][y] = -1;
        bomb_possible.splice(random, 1);
    }

}

function createGridNumber(cell){

    function getNumberBomb(cell){
            
            let {x, y} = getCoordinates(cell);

            if(grid_number[x][y] == -1){
                return -1;
            }
    
            let count = 0;
    
            if((x - 1) >= 0 && (y - 1) >= 0 && grid_number[x - 1][y - 1] == -1){
                count++;
            }
    
            if((x - 1) >= 0 && grid_number[x - 1][y] == -1){
                count++;
            }
            
            if((x - 1) >= 0 && (y + 1) < grid_size_y && grid_number[x - 1][y + 1] == -1){
                count++;
            }
    
            if((y - 1) >= 0 && grid_number[x][y - 1] == -1){
                count++;
            }
    
            if((y + 1) < grid_size_y && grid_number[x][y + 1] == -1){
                count++;
            }
    
            if((x + 1) < grid_size_x && (y - 1) >= 0 && grid_number[x + 1][y - 1] == -1){
                count++;
            }
    
            if((x + 1) < grid_size_x && grid_number[x + 1][y] == -1){
                count++;
            }
    
            if((x + 1) < grid_size_x && (y + 1) < grid_size_y && grid_number[x + 1][y + 1] == -1){
                count++;
            }
            
            return count;
    }

    for(let i = 0; i < grid_number.length; i++){
        for(let j = 0; j < grid_number[i].length; j++){
            grid_number[i][j] = getNumberBomb(grid[i][j]);
        }
    
    }

    clickCell(cell);

}

function clairCell(cell){
    
    let {x, y} = getCoordinates(cell);

    let span = document.createElement("span");
    span.classList.add("cell_" + grid_number[x][y]);
    span.innerHTML = grid_number[x][y];
    cell.appendChild(span);
    cell.classList.add("reveal");

    if(grid_number[x][y] == 0){
        cell.innerHTML = "";
    }
}

function clearZone(cell_begin){

    let safe = [];
    safe.push(cell_begin);

    while(safe.length > 0){

        let cell = safe.pop();
        clairCell(cell);

        let {x, y} = getCoordinates(cell);

        if(grid_number[x][y] == 0){
            
            if((x - 1) >= 0 && (y - 1) >= 0 && !safe.includes(grid[x - 1][y - 1]) && !grid[x - 1][y - 1].classList.contains("reveal")){
                safe.push(grid[x - 1][y - 1]);
            }

            if((x - 1) >= 0 && !safe.includes(grid[x - 1][y]) && !grid[x - 1][y].classList.contains("reveal")){
                safe.push(grid[x - 1][y]);
            }

            if((x - 1) >= 0 && (y + 1) < grid_size_y && !safe.includes(grid[x - 1][y + 1]) && !grid[x - 1][y + 1].classList.contains("reveal")){
                safe.push(grid[x - 1][y + 1]);
            }

            if((y - 1) >= 0 && !safe.includes(grid[x][y - 1]) && !grid[x][y - 1].classList.contains("reveal")){
                safe.push(grid[x][y - 1]);
            }

            if((y + 1) < grid_size_y && !safe.includes(grid[x][y + 1]) && !grid[x][y + 1].classList.contains("reveal")){
                safe.push(grid[x][y + 1]);
            }

            if((x + 1) < grid_size_x && (y - 1) >= 0 && !safe.includes(grid[x + 1][y - 1]) && !grid[x + 1][y - 1].classList.contains("reveal")){
                safe.push(grid[x + 1][y - 1]);
            }

            if((x + 1) < grid_size_x && !safe.includes(grid[x + 1][y]) && !grid[x + 1][y].classList.contains("reveal")){
                safe.push(grid[x + 1][y]);
            }

            if((x + 1) < grid_size_x && (y + 1) < grid_size_y && !safe.includes(grid[x + 1][y + 1]) && !grid[x + 1][y + 1].classList.contains("reveal")){
                safe.push(grid[x + 1][y + 1]);
            }

        } 

    }

}

function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 10);
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = elapsedTime % 1000;
    
    const formattedTime = `
        ${hours != 0 ? String(hours).padStart(2, '0') + ":" : ""}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
    
    document.getElementById('time').textContent = formattedTime;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    document.getElementById('time').textContent = '00:00:000';
}

function clickCell(cell){

    if(!first){
        startTimer();
        createBomb(cell);
        createGridNumber(cell);
    } else if(!game_over) {

        let {x, y} = getCoordinates(cell);

        if(grid_number[x][y] == -1){
            game_over = true;
            gameLoose();
        } else if(!cell.classList.contains("reveal") && !cell.classList.contains("flag")) {
            clairCell(cell);

            if(grid_number[x][y] == 0){
                clearZone(cell);
            }
        }

    }
    
}

function gameWin(){
    game_win = true;
    stopTimer();
    
    for(let i = 0; i < grid_size_x; i++){
        for(let j = 0; j < grid_size_y; j++){
            if(grid_number[i][j] == -1){
                grid[i][j].innerHTML = "";
                let span = document.createElement("span");
                span.classList.add("bomb");
                span.innerHTML = "💣";
                grid[i][j].appendChild(span);
            }
        }
    }

    let p = document.createElement('p');
    p.id = 'win';
    p.innerHTML = `Vous avez gagné !`;

    document.getElementById('message').appendChild(p);

}

function gameLoose(){
    stopTimer();

    for(let i = 0; i < grid_size_x; i++){
        for(let j = 0; j < grid_size_y; j++){
            if(grid_number[i][j] == -1){
                if(grid[i][j].classList.contains("flag")){
                    grid[i][j].style.backgroundColor = "green";
                }
                grid[i][j].innerHTML = "";
                let span = document.createElement("span");
                span.classList.add("bomb");
                span.innerHTML = "💣";
                grid[i][j].appendChild(span);
            }
        }
    }

    for(let i = 0; i < grid_size_x; i++){
        for(let j = 0; j < grid_size_y; j++){
            if(grid_number[i][j] != -1 && grid[i][j].classList.contains("flag")){
                grid[i][j].innerHTML = "";
                let span = document.createElement("span");
                span.classList.add("bomb");
                span.innerHTML = "❌";
                grid[i][j].appendChild(span);
            }
        }
    
    }

    let p = document.createElement('p');
    p.id = "lose";
    p.innerHTML = `Vous avez perdu ! <br> Il vous manquait ${bomb_count} bombe${bomb_count > 1 ? "s" : ""} à trouver.`;

    document.getElementById('message').appendChild(p);

}

function rightClick(cell){

    if(!first){
        return;
    } else if(!cell.classList.contains("reveal")){

        if(cell.classList.contains("flag")){
            cell.classList.remove("flag");
            cell.innerHTML = "";
            bomb_count++;
            flag.slice(flag.indexOf(cell), 1);
        } else {
            cell.classList.add("flag");
            
            let span = document.createElement("span");
            span.classList.add("flag");
            span.innerHTML = "🚩";
            cell.appendChild(span);
            bomb_count--;
            flag.push(cell)
        }

        document.getElementById('counter').innerHTML = bomb_count;

        if(bomb_count == 0){
            
            let counter = 0;

            for(let i = 0; i < flag.length; i++){
                let {x, y} = getCoordinates(flag[i]);

                if(grid_number[x][y] == -1){
                    counter++;
                }
            }

            if(counter == bomb){
                gameWin();
            }

        }

    }
    
}

function resetFunction(){
    table.innerHTML = "";
    grid = [];
    grid_number = [];
    game_over = false;
    game_win = false;
    first = false;
    resetTimer();
    document.getElementById('message').innerHTML = "";
}

reset.addEventListener("click", function(){
    resetFunction();
    createGrid();
});

createGrid();