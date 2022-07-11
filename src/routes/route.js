let express=require("express")
let router=express.Router()
let userController=require("../controllers/userController")
let {createBook,getBooks, updateBook,deleteBook , getBookById} =require("../controllers/bookController")
let {createReview,updateReview,deleteReview}=require("../controllers/reviewController")
let { authenticate, authorise,authoriseDelete, authorisePutAndDelete }=require("../middleware/auth")
router.post("/register",userController.createUser)
router.post("/login",userController.userLogin)

router.post("/books",authenticate,authorise,createBook)
router.get("/books",authenticate, getBooks)
router.get("/books/:bookId",authenticate, getBookById)
router.put("/books/:bookId",authenticate,authorisePutAndDelete,updateBook)
router.delete("/books/:bookId",authorisePutAndDelete,deleteBook)

router.post("/books/:bookId",createReview)
router.put("/books/:bookId/review/:reviewId",updateReview)
router.delete("/books/:bookId/review/:reviewId",deleteReview)


module.exports=router;