const Category = require('../models/Category');
const { Mongoose } = require("mongoose");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

//create Category ka handler function
exports.createCategory = async (req,res) => {
    try{
        //fetch data
        const {name, description} = req.body;

        //validation 
        if(!name) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }

        //create entry in DB
        const CategorysDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(CategorysDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:'Category created successfully',
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//getAllTags handler function
exports.showAllCategories =  async (req,res) => {
    try{
        const allCategorys = await Category.find({},{name:true, description:true});
        return res.status(200).json({
            success:true,
            message:'All categories returned successfully',
            date:allCategorys,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

//change the tag from category
//category page details

exports.categoryPageDetails = async (req, res) => {
    try{
        //get category id
        const {categoryId} = req.body;
        console.log("printing category id: ", categoryId);

        //get courses for specified category id
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path:"courses",
                match:{ status: "Published"},
                populate: "ratingAndReviews",
            })
            .exec();

        //validation : Handle the case when category is not found
        if(!selectedCategory){
            console.log('category not found');
            return res.status(404).json({
                success:false,
                message:'Category Not Found',
            });
        }
        console.log("Selected course for category inside category Controller: ", selectedCategory)
        // handle the case when there are no course
        if(selectedCategory.courses.length === 0){
            console.log("No Course Found for the Selecetd Category");
            return res.status(404).json(({
                success:false,
                message: "No course found for the selected Category",
            }))
        }
         
        //get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: {$ne: categoryId},
        })

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
        .populate({
            path:"courses",
            match: {status: "Published"},
        })
        .exec();

        console.log("Different COURSE", differentCategory)
        //get top selling courses
        //HW- write it on your own

        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published"},
                populate: {
                    path: "instructor"
                },
            })
            .exec()

        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a,b) => b.sold - a.sold)
            .slice(0,10)

        // console.log("mostSellingCourses COURSE", mostSellingCourses)
        //return response
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategory,
                mostSellingCourses
            },
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "Internal Server error",
            error:error.message,
        });
    }
}