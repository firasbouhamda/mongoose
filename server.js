const express = require('express');
const app = express();
const port = 5000;
const createPerson = require('./routes/createPerson');
const findPerson = require('./routes/findPerson');
const Person = require('./Models/person');
const connectDB = require('./helper/connectDB');
app.use(express.json());

app.listen(port, (err) => {
    err ? console.log(err) : console.log('server is running in port 5000')
});
connectDB();

//Creating record and saving it
app.use('/person', createPerson);

//Finding a record
app.use('/findperson', findPerson);

//Performing Classic Updates by running Finf,Edit and Save
function addHamburger(food){
    const test = false;
    food.map((el) => {
        if (el.toLowerCase() === 'hamburger') {
            test = true;
            return food;
        }
    });
    if (!test) food.push('Hamburger');
    return food;
}
app.put('/updateFood/:id', (req,res) =>
{
    Person.findById({_id: req.params.id}, (err,result) => {
        if (err) res.send('error',err)
        else {
            addHamburger(result.favoriteFoods);
            result.save((err) => {
                if (err) console.error('error!');
            });
            res.send(result);
        }
    });
});

//Performing new updates on a document using model.finOneAndUpdate()
app.put('/updateAge/:name', (req,res) => {
    Person.findOneAndUpdate({name: req.params.name}, {age: 20}, {new: true})
    .then((docs) => res.send(docs))
    .catch((err) => res.send(err));
});
//Finding all persons
app.get("/", (req,res) => {
    console.log(req.params);
    Person.find()
    .exec()
    .then((docs) => {
        res.status(200).send(docs);
    })
    .catch((err) => res.send(err));
});

//Deleting person
app.delete('/delete/:id', (req,res) => {
    Person.findByIdAndRemove({_id: req.params.id}, (err,result) => {
        if (err) {
            res.send('error!',err);
        } else {
            res.send('Deleted person: ${result}');
        }
    });
});

//MongoDB and Mongoose-Deleteing many documents
app.delete('/deleteMary', (req,res) => {
    Person.remove({name: 'Mary'}, (err,result) => {
        if (err) {
            res.send(err);
        } else res.send(result);
    });
});

//Chain searching query helpers to narrow search results
app.get('/burrito', (req,res) => {
    Person.find({favoriteFoods: 'burrito'})
    .sort({name: 1})
    .limit(2)
    .select({age: false})
    .exec((err,data) => {
        if (err) {
            res.send(err);
        } else {
            if (!data[0]) {
              res.send ('There is no person who like burrito');
            } else res.send(data);
            
        }
    });
});



