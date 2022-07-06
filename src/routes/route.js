let express=require("express")
let router=express.Router()
let userController=require("../controllers/userController")
let bookController=require("../controllers/bookController")
router.post("/createUser",userController.createUser)
router.post("/login",userController.userLogin)

router.post("/books",bookController.createBook)
router.get("/books",bookController.getBooks)



module.exports=router;