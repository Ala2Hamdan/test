'use strict';
require('dotenv').config();
const PORT = process.env.PORT;
const DATABASE_URL=process.env.DATABASE_URL;
const express =require('express');
const superagent =require('superagent');
const pg =require('pg');

const client = new pg.Client(DATABASE_URL);

const methodoverride = require('method-override');

const app =express();

app.use(express.urlencoded({extended:true}));
app.use(methodoverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/home',homePageFunction);
app.get('/display-character',getFavCharacter);
app.get('/create-character',renderForm);
app.get('/create-my-character',getAllCharacter);
app.get('/character/:id',detailsFunction);

app.post('/create-character', createCharacter);
app.post('/favorite-character', saveFavChaeracter);

function homePageFunction(req ,res){
    let url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url).then(data =>{
        // console.log(data.body);
      const results = data.body.map(element =>new Character(element));
            // console.log(results);
        res.render('pages/index',{resultdata:results});
    })
}
function saveFavChaeracter(req,res){
    console.log(req.body);
    const {name,house,patronus,alive}=req.body;
    const sql= `INSERT INTO harry (name,house,patronus,is_alive,created_by)values($1,$2,$3,$4,$5);`;
    const value =[name,house,patronus,alive,'api'];
    client.query(sql,value).then( results =>{
        res.redirect('/display-character')
    })

}
function getFavCharacter(req,res){
const sql =`select * from harry where created_by=$1;`;
client.query(sql ,['api']).then( dbresult =>{
    res.render('pages/favorite-character',{results:dbresult.rows});
})
}
function renderForm(req,res){
    res.render('pages/create-character');
}
function createCharacter(req, res){
    console.log(req.body);
    const {name,house,patronus,alive}=req.body;
    const sql= `INSERT INTO harry (name,house,patronus,is_alive,created_by)values($1,$2,$3,$4,$5);`;
    const value =[name,house,patronus,alive,'user'];
    client.query(sql,value).then( results =>{
        res.redirect('/create-my-character');
    });
}
function getAllCharacter(req,res){
    const sql =`select * from harry where created_by=$1;`;
    client.query(sql ,['user']).then( dbresult =>{   
        res.render('pages/favorite-character',{results:dbresult.rows});
    })   
}
function detailsFunction(req,res){
    const id= req.params.id;
    console.log(id)
    const sql =`select * from harry where id=$1;`;
    client.query(sql ,[id]).then( result =>{   
    console.log(result.rows[0]);
    res.render('pages/details',{results:result.rows[0]});
    }) 
}

function Character (charInfo){
    this.name = charInfo.name;
    this.house = charInfo.house;
    this.patronus = charInfo.patronus;
    this.alive = charInfo.alive;
}
app.delete('/character/:id',deleteFunction)
function deleteFunction(req,res){
    const id= req.params.id;
    const sql =`delete from harry where id=$1;`;
    client.query(sql ,[id]).then( result =>{ 
        res.redirect('/display-character');
    })  
}
app.put('/character/:id',updateFunction)
function updateFunction(req,res){
    const id= req.params.id;
    console.log(id)
    const{name,house,patronus,alive}=req.body;
    console.log(req.body);
    const sql =`update harry set name=$1,house=$2,patronus=$3,is_alive=$4 where id=$5;`;
    let values =[name,house,patronus,alive,id];
    client.query(sql ,values).then( result =>{ 
        res.redirect(`/character/:${id}`);
    })  
}

client.connect().then(()=>{
app.listen(PORT ,()=>{
     console.log(`app Listening to port ${PORT}` );
})
}).catch(error => console.loge(error));
