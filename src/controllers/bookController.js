const bookModel = require("../models/bookModel.js");
const userModel = require("../models/userModel.js");
const reviewsModel=require("../models/reviewModel")
const mongoose = require("mongoose");
const moment=require("moment")
const {
  validateString,
  convertToArray,
  checkValue,
  validateRequest,
  validateNumber,
 isValidObjectId,
 isValidISBN
} = require("../validator/validation");

// =========================POST BOOK =========================

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


    if (!ISBN) {return res.status(400).send({status:false,message:"please provide ISBN"})}
      
      if(!isValidISBN(ISBN)){return res.status(400).send({status:false,message:"please provide a valid ISBN"})}
      const isDuplicate = await bookModel.find({ ISBN: ISBN });
      if (isDuplicate.length == 0) {
        book.ISBN = ISBN;
      } else {
        return res.status(400).send({
          status: false,
          message: "This ISBN is already present in books collection",
        });
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
      book.releasedAt = moment().toISOString();
    } else {
      return res
        .status(400)
        .send({ status: false, message: "releasedAt is required" });
    }

    let createdBook = await bookModel.create(book);
    res.status(201).send({status:true,data:createdBook});
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// =========================GET BOOK QUERY PARAM =========================

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
            updatedAt: 0,
            __v:0,
            isDeleted:0
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


// =========================GET BOOK BY BOOK ID =========================

const getBookById = async function(req, res) {
  try {
      const bookId = req.params.bookId
      if(!isValidObjectId(bookId)){
          return res.status(400).send({
              status: false,
              message: "Bookid invalid"
          })
      }
          const data = await bookModel.find({_id: bookId})
            

          if(!data){
              return res.status(404).send({
                  status: false,
                  message: "Book does not exist"
              })
          }
          if(data.isDeleted==true){
              return res.status.send({
                  status: false,
                  message: "Book already deleted"
              })
          }

          const reviewArray = await reviewsModel.find({
              bookId: data._id,
              isDeleted: false
          }).select({_v: 0, isDeleted: 0})
          
        let find=await bookModel.findOne({_id:bookId},{ISBN:0,__v:0}).lean()
        find.reviewsData = reviewArray
          return res.status(200).send({
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



// =========================UPDATE BOOK BY BOOKID =========================

  const updateBook = async function (req, res) {

    try {
      let id = req.params.bookId;
      let data = req.body;
      
    if(!isValidObjectId(id)){return res.status(400).send({status:false,message:"please provide a valid bookId"})}
      if(!validateRequest(data)){return res.status(400).send({status:false,message:"please provide body data"})}
      let book = await bookModel.findOne({_id:id, isDeleted: false })

      if (book== null) {
        return res.status(404).send({status:true,message:'No such book found'});
      }
     ;
      if(!validateString(data.title)){return res.status(400).send({status:false,message:"please provide valid title"})}
      let duplicateTitle = await bookModel.find({ title:data.title })

      

      if(duplicateTitle.length!=0){return res.status(400).send({status:false,message:"this title is already present"})}
       else{ book.title = data.title;}
     
       if(!validateString(data.excerpt)){return res.status(400).send({status:false,message:"please provide valid excerpt"})}
       let duplicateExcerpt = await bookModel.find({ excerpt:data.excerpt })
       if(duplicateExcerpt.length!=0){return res.status(400).send({status:false,message:"this excerpt is already present"})}
      else{ book.excerpt = data.excerpt;}
     
      if(!validateString(data.ISBN)){return res.status(400).send({status:false,message:"please provide ISBN"})}
      if(data.ISBN && !isValidISBN(data.ISBN)){return res.status(400).send({status:false,message:"ISBN must be in right format"})}
      let duplicateISBN = await bookModel.find({ ISBN:data.ISBN })
       if(duplicateISBN.length!=0){return res.status(400).send({status:false,message:"this ISBN is already present"})}
     else{ book.ISBN = data.ISBN;}
     
     if(!validateString(data.releasedAt)){return res.status(400).send({status:false,message:"please provide a valid releasedAt"})}
     if(data.releasedAt){ book.releasedAt = data.releasedAt;}
      
      
      let updateData = await bookModel.findOneAndUpdate({_id:id}, {$set:book}, {
        new: true,
      });
      res.status(200).send({status:true, message: " Data is Updated ", data:updateData});
    } catch (err) {
      res.status(500).send({ status:false, error: err.message });
    }
  };

// =========================DELETE BOOK BY BOOK ID =========================

  const deleteBook = async function (req, res) {
    try {
      let bookId = req.params.bookId;
      if (bookId.length==0)
       {return res.status(400).send({ status: false, msg: "Please include an bookId" })};
        if(!isValidObjectId(bookId)){return res.status(400).send({ status: false, msg: "Please enter a valid bookId" })}
      let book = await bookModel.findById(bookId);
      if (!book)
        return res.status(404).send({ status: false, msg: "BOOK NOT FOUND" });
      if (book.isDeleted == true) {
       return res
          .status(400)
          .send({ status: false, msg: "This bookdata is already deleted" });
      }
      let newData = await bookModel.findOneAndUpdate(
        { _id: bookId },
        { $set: { isDeleted: true,deletedAt: moment().toISOString()
         } },
        { new: true }
      );
      res.status(200).send({ status: true , message:"Success" });
    } catch (err) {
      res.status(500).send({ status: false, msg: "ERROR", error: err.message });
    }
  };

module.exports={createBook,getBooks, updateBook,deleteBook, getBookById }
