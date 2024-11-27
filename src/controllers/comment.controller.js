import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Video does not exists or Invalid videoId")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:limit
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoRef",
                pipeline:[
                    {
                        $project:{
                            title:1,
                            owner:1,
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerRef",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                        }
                    }
                ]
            }
        },
    ])

    const totalComments = comments?.length || 0

    return res.status(200).json(new ApiResponse(200, {totalComments ,comments}, "comments fetched successfully"))

})

const getTweetComments = asyncHandler(async(req, res) =>{
    const {tweetId} = req.params
    const {page=1, limit = 10} = req.query

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "tweetId invalid")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                tweet:tweetId
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:limit
        },
        {
            $lookup:{
                from:"tweets",
                localField:"tweet",
                foreignField:"_id",
                as:"tweetRef",
                pipeline:[
                    {
                        $project:{
                            owner:1,
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerRef",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                        }
                    }
                ]
            }
        },
    ])

    const totalComments = comments?.length || 0

    return res.status(200).json(new ApiResponse(200, {totalComments ,comments}, "comments fetched successfully"))

})

const addCommentToVideo = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }
    
    if(!content || content.trim()===""){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content:content.trim(),
        video:videoId,
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, {comment}, "Comment added successfully"))
})
const addCommentToTweet = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId")
    }
    
    if(!content || content.trim()===""){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content:content.trim(),
        tweet:tweetId,
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, {comment}, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "commentId Invalid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400, "Comment does not exists")
    }

    const userId = req.user._id;
    const ownerId = comment.owner

    if(userId.toString()!==ownerId.toString()){
        throw new ApiError(400, "Action not allowed")
    }

    if(!content || content.trim()===""){
        throw new ApiError(400, "Nothing to update")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:content.trim()
            }
        },{new: true}
    )

    return res.status(202).json(new ApiResponse(202, {updatedComment}, "Update comment success"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "commentId Invalid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400, "Comment does not exists")
    }

    const userId = req.user._id;
    const ownerId = comment.owner

    if(userId.toString()!==ownerId.toString()){
        throw new ApiError(400, "Action not allowed")
    }

    await Comment.deleteOne(comment)

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

const addReply = asyncHandler(async(req, res)=>{
    
}) 

export {
    getVideoComments, 
    getTweetComments,
    addCommentToVideo, 
    addCommentToTweet,
    updateComment,
     deleteComment
    }