let express=require("express")
let router=express.Router()
let userController=require("../controllers/userController")
let {createBook,getBooks, updateBook,deleteBook } =require("../controllers/bookController")
let { authenticate, authorise }=require("../middleware/auth")
router.post("/register",userController.createUser)
router.post("/login",userController.userLogin)

router.post("/books",authenticate,authorise,createBook)
router.get("/books",authenticate, getBooks)
router.put("/books/:bookId",updateBook)
router.delete("/books/:bookId",deleteBook)



module.exports=router;