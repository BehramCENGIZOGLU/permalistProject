import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user:"postgres",
  password:"1234",
  database:"permalist",
  host:"localhost",
  port:5432
});

db.connect();

async function todoItems() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  return result.rows;
}

async function addTodo(item) {
  try {
    if(!item){
      return null;
    }else{  
      await db.query(
        "INSERT INTO items (title) VALUES ($1)",[item]);
    }
  } catch (error) {
    console.log(error);
  }
}

async function updateTodo(item, itemId) {
  try {
    if(!itemId || !item){
      return null;
    }else{
      await db.query(
        "UPDATE items SET title = $1 WHERE id = $2",[item, itemId]);
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteTodo(itemId) {
  try {
    if(!itemId){
      return null;
    }else{
      await db.query(
        "DELETE FROM items WHERE id = ($1)",[itemId]);
    }
  } catch (error) {
    console.log(error);
  }
}

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async(req, res) => {
  const result = await todoItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: result,
  });
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  await addTodo(item);
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const itemId = req.body.updatedItemId;
  const item = req.body.updatedItemTitle;
  await updateTodo(item, itemId);
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const itemId = req.body.deleteItemId;
  await deleteTodo(itemId);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
