const express = require('express');
const fs = require('fs');
const app = express();
const mongoose = require("mongoose");
const Book = require("./models/Book");
const port = 3000;
app.use(express.json());

mongoose.connect("mongodb://localhost:27017")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/books', async (req, res) => {
   try {
        const bookdata = {
            title: req.body.title,
            author: req.body.author,
            year: req.body.year,
            available: true
        };
    const book = await Book.create(bookdata);
    res.status(201).json(book);
}
 catch (error) {
    console.log(error.errors);
    console.log(error.name);

    if (error.name === "ValidationError") {
    // send 400
    res.status(400).json({
    "error": "Validation failed",
    "details": {
        // your details here
        author: error.errors.author ? error.errors.author.message : undefined,
        title: error.errors.title ? error.errors.title.message : undefined,
        year: error.errors.year ? error.errors.year.message : undefined
    }
});
}
  else {
    // send 500
    res.status(500).json({ error: "Internal server error" });
}

    }
});

    app.get('/books', async (req, res) => {
        try {
            const filter = {};
            if (req.query.author) {
                filter.author = req.query.author;
            }
        if (req.query.available) {
            filter.available = req.query.available === 'true';
        }
            const books = await Book.find(filter);
            res.status(200).json(books);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    });


app.get('/books/:id', async (req, res) => {
    try {
       
            const book = await Book.findById(req.params.id);
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }
            res.status(200).json(book);
        
    } catch (error) {
        console.error(error);
       if (error.name === "CastError"){ 
        res.status(400 ).json({ error: "Invalid book ID" })
    }
    else {
        res.status(500).json({ error: "Internal server error" });

    }
}});


app.put('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        if (error.name === "CastError") {
            res.status(400).json({ error: "Invalid book ID" });
        }
       else if (error.name === "ValidationError") {
            res.status(400).json({
                "error": "Validation failed",
                "details": {
                    "author": error.errors.author ? error.errors.author.message : undefined,
                    "title": error.errors.title ? error.errors.title.message : undefined,
                    "year": error.errors.year ? error.errors.year.message : undefined
                }
            });
            
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }}
);

app.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error(error);
        if (error.name === "CastError" || error.name === "ValidationError") {
            res.status(400).json({ error: "Invalid book ID" });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});



app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
