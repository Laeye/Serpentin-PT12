// Read name in names.txt
const { info } = require('console');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const express = require('express');
const cors = require('cors');

const default_names = fs.readFileSync(path.join(__dirname, 'names.txt'), 'utf8').split('\r\n');

function initConfig(){
    const eleves = [];
    default_names.forEach(name => {
        eleves.push({name: name, priority: false, history: []});
    })
    fs.createWriteStream(path.join(__dirname, 'config.json')).write(JSON.stringify(eleves));
}

/*
              Colonnes
Lignes | | |   | | | 
       | | |   | | |
       | | |   | | |
       | | |   | | |
       | | |   | | |
       | | |   | | |
*/

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function resetHistory(){
    const eleves = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    eleves.forEach(eleve => {
        eleve.history = [];
    })
    fs.createWriteStream(path.join(__dirname, 'config.json')).write(JSON.stringify(eleves));
}

function randomGenerate(){
    let places = [];
    for(let i = 0;i < 6;i++){
        places[i] = ["","","","","",""];
    }
    let index = 0;
    const eleves = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    eleves.forEach(eleve => {
        places[Math.floor(index/6)][(index%6)] = eleve;
        index++;
    });
    return places;
}

function tryRandom(serpentin){
    let index = 0;
    while(index < 36){
        let eleve = serpentin[Math.floor(index/6)][(index%6)];
        if(correct(eleve,Math.floor(index/6))){
            index++;
        }else{
            let random = getRandomInt(0,36);
            let eleve2 = serpentin[Math.floor(random/6)][(random%6)];
            serpentin[Math.floor(index/6)][(index%6)] = eleve2;
            serpentin[Math.floor(random/6)][(random%6)] = eleve;
            index = Math.min(index,random);
        }
    }
}

function correct(eleves,index){
    let history = eleves.history;
    if(eleves.priority == false){
        return !(history.includes(index));
    }else{
        if(index > 2){
            return false;
        }
        if(history.includes(0) && index == 0){
            return false;
        }
        return true;
    }
}

function saveHistory(serpentin){
    serpentin.forEach((info,index) => {
        info.forEach(eleve => {
            eleve.history.reverse();
            eleve.history.push(index);
            eleve.history.reverse();
            if(eleve.history.length > 4){
                eleve.history.pop();
            }
        })
    })

    data = [];

    serpentin.forEach(info => {
        info.forEach(eleve => {
            data.push(eleve);
        })
    })

    pushData(data);
}

function pushData(eleves){
    fs.createWriteStream(path.join(__dirname, 'config.json')).write(JSON.stringify(eleves));
}


let serpentin = randomGenerate();
tryRandom(serpentin);
saveHistory(serpentin);

const job = schedule.scheduleJob('0 * * * * *', function(){
    let serpentin = randomGenerate();
    tryRandom(serpentin);
    saveHistory(serpentin);
    console.log(job.nextInvocation())
})

console.log(job.nextInvocation())

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json(JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')));
})


app.listen(3000, () => {
    console.log('Server started');
});