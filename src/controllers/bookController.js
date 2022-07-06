const bookModel = require("../models/bookModel.js");
const userModel = require("../models/userModel.js");
const mongoose = require("mongoose");
const {
  validateString,
  convertToArray,
  checkValue,
  validateEmail,
  validatePassword,
  validateRequest,
  validateNumber,
 isValidObjectId 
} = require("../validator/validation");

const createBook = async function (req, res) {
  try {
    let { title, excerpt, userId,ISBN, category, subcategory, reviews, releasedAt } = req.body;
    let book = {};
    if (!validateRequest(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "Please input valid request" });
    }
    if (title) {
      if (!validateString(title)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid title" });
      } else {
        book.title = title;
      }
    } else {
      return res.status(400).send({ status: false, message: "Title is required" });
    }

    if (title) {
      if (!validateString(title)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid title" });
      }
      const isDuplicate = await bookModel.find({ title: title });
      if (isDuplicate.length == 0) {
        book.title = title;
      } else {
        return res.status(400).send({
          status: false,
          message: "This title is already present in books collection",
        });
      }
    } else {
      return res.status(400).send({ status: false, message: "Title is required" });
    }

    if (excerpt) {
      if (!validateString(excerpt)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid excerpt" });
      } else {
        book.excerpt = excerpt;
      }
    } else {
     return res.status(400).send({ status: false, message: "Excerpt is required" });
    }

    if (userId) {
        if(!isValidObjectId(userId)){
            return res.status(400).send({status: false, message: "Invalid userId"})
        }
      let isDuplicate = await userModel.find({_id: userId});
      if (isDuplicate.length == 0) {
        return res.status(400).send({
          status: false,
          message: "This UserID not present in the user collection",
        });
      } else {
        book.userId = userId;
      }
    } else {
      return res
        .status(400)
        .send({ status: false, message: "UserId is required" });
    }


    if (ISBN) {
      if (!validateString(ISBN)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid ISBN" });
      }
      const isDuplicate = await bookModel.find({ ISBN: ISBN });
      if (isDuplicate.length == 0) {
        book.ISBN = ISBN;
      } else {
        return res.status(400).send({
          status: false,
          message: "This ISBN is already present in books collection",
        });
      }
    } else {
     return res.status(400).send({ status: false, message: "ISBN is required" });
    }





    if (category) {
      if (!validateString(category)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a valid category" });
      } else {
        book.category = category;
      }
    } else {
     return res.status(400).send({ status: false, message: "Category is required" });
    }

    if (subcategory != undefined) {
      subcategory = convertToArray(subcategory);
      if (!subcategory) {
        return res
          .status(400)
          .send({ status: false, msg: "Invalid Subcategory." });
      } else {
        book.subcategory = subcategory;
      }
    } else {
     
     return res
        .status(400)
        .send({ status: false, message: "Subcategory is required" });
    }

    if (!validateNumber(reviews)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid review" });
    } else {
      book.reviews = reviews;
    }

    if (releasedAt) {
      book.releasedAt = releasedAt;
    } else {
      return res
        .status(400)
        .send({ status: false, message: "releasedAt is required" });
    }

    let createdBook = await bookModel.create(book);
    res.status(201).send(createdBook);
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


const getBooks = async function(req, res) {
    try{
        const queryData = req.query
        let obj = {
            isDeleted: false
        }

        if(Object.keys(queryData).length !==0) {

            let {userId, category, subcategory} = queryData

            if(userId){
                if(!isValidObjectId(userId)){
                    return res.status(400).send({status: false, message: "Invalid userId"})
                }
                obj.userId = userId
                }else {
                    return res
                      .status(400)
                      .send({ status: false, message: "UserId is required" });
                  }
            if(category && validateString(category)) {
                obj.category = category
            }
            if(subcategory && validateString(subcategory)) {
                obj.subcategory = {$in: subcategory}
            }

        }
        let find = await bookModel.find(obj).select({
            ISBN: 0,
            subcategory: 0,
            createdAt: 0,
            updatedAt: 0
        }).sort({title: 1})

        if(find.length == 0) {
            return res.status(404).send({
                status: false,
                message: "No such book found"
            })
        }
        res.status(200).send({
            status: true,
            message: "Book List",
            data: find
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}
const updateBook = async function (req, res) {

    try {
      let id = req.params.bookId;
      let data = req.body;
      let book = await bookModel.findOne({ _id: id, isDeleted: false });
      if (Object.keys(book).length == 0) {
        return res.status(404).send('No such book found');
      }
      if (data.title) book.title = data.title;
      if (data.excerpt) book.excerpt = data.excerpt;
      if (data.ISBN) book.ISBN = data.ISBN;
      if (data.releasedAt) book.releasedAt = data.releasedAt;
       
      let updateData = await bookModel.findByIdAndUpdate({ _id: id }, book, {
        new: true,
      });
      res.status(200).send({ message: " Data is Updated "});
    } catch (err) {
      res.status(500).send({ message: 'Error', error: err.message });
    }
  };

  const deleteBook = async function (req, res) {
    try {
      let bookId = req.params.bookId;
      if (!bookId)
        res.status(400).send({ status: false, msg: "Please include an bookId" });
      let book = await bookModel.findById(bookId);
      if (!book)
        return res.status(404).send({ status: false, msg: "BOOK NOT FOUND" });
      if (book.isDeleted == true) {
        res
          .status(400)
          .send({ status: false, msg: "This bookdata is already deleted" });
      }
      let newData = await bookModel.findOneAndUpdate(
        { _id: bookId },
        { $set: { isDeleted: true,deletedAt: Date.now() } },
        { new: true }
      );
      res.status(200).send({ status: true });
    } catch (err) {
      res.status(500).send({ status: false, msg: "ERROR", error: err.message });
    }
  };

module.exports={createBook,getBooks, updateBook,deleteBook }
