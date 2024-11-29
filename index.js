require('dotenv').config();

const express = require("express");
const app = express();

const path = require("path");

const mysql = require("mysql2");

const methodOverride = require("method-override");

app.use(methodOverride("_method"));

const port = 8080;

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.listen(port, ()=>{
    console.log(`Server listening on Port : ${port}`);
});

app.get("/task", (req,res)=>{
    res.render("index.ejs");
});

app.get("/task/add", (req,res)=>{
    res.render("add.ejs");
});

app.post("/task/add", (req,res)=>{
    let {title,assignee,description,date,priority}=req.body;
    let q = `INSERT INTO tasks (title,description,assignee,date,priority) VALUES (?,?,?,?,?)`;
    try{
        connection.query(q,[title,description,assignee,date,priority], (err,result)=>{
            if(err){
                throw err;
            }
            else{
                res.redirect("/task/list");
            }
        });
    }catch(err){
        console.log(err);
    }
    
});

app.get("/task/list",(req,res)=>{
    let q =`SELECT * FROM tasks`;
    try {
        connection.query(q, (err,result)=>{
            if(err) throw err;
            else{
                const tasks=result;
                res.render("task-list.ejs", {tasks});
            }
        });
    } catch(err) {
        res.send(err);
    }
});

app.get("/task/:id/details", (req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM tasks WHERE id=?`;
    try{
        connection.query(q,[id],(err,result)=>{
            if(err) throw err;
            else{
                res.render("details.ejs", {task: result[0]});
            }
        });
    }catch(err){
        res.send(err);
    }
});

app.get("/task/:id/edit", (req,res)=>{
    let {id}= req.params;
    let q = `SELECT * FROM tasks WHERE id=?`;
    try{
        connection.query(q,[id],(err,result)=>{
            if(err) throw err;
            else{
                res.render("edit.ejs", {task: result[0]});
            }
        });
    }catch(err){
        res.send(err);
    }

});

app.patch("/task/:id/edit", (req,res)=>{
    let {id}= req.params;
    let {title,description,assignee,date,priority} = req.body;
    let q = `UPDATE tasks SET title=?, description =?, assignee=?, date=?, priority=? WHERE id=?`;
    try{
        connection.query(q,[title,description,assignee,date,priority,id],(err,result)=>{
            if(err) throw err;
            else{
                let q1 = `SELECT * FROM tasks WHERE id= ?`;
                try{
                    connection.query(q1, [id],(err,result)=>{
                        if(err) throw err;
                        else{
                            res.render("details.ejs", {task: result[0]});
                        }
                    });
                }catch(err){

                }
            }
        });
    }catch(err){
        res.send(err);
    }
});