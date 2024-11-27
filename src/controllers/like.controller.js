import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const isLiked = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    }).select("-comment -tweet")
    

    if(isLiked){
        await Like.deleteOne(isLiked)

        return res.status(200).json(new ApiResponse(200, {}, "Video Not liked success"))
    }

    const like = await Like.create({
        video:videoId,
        likedBy:req.user._id
    })

    return res.status(201).json(new ApiResponse(201, like, "Video liked success"))


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }

    const isLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    }).select("-video -tweet")
    

    if(isLiked){
        await Like.deleteOne(isLiked)

        return res.status(200).json(new ApiResponse(200, {}, "Comment Not liked success"))
    }

    const like = await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })

    return res.status(201).json(new ApiResponse(201, like, "Comment liked success"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId")
    }

    const isLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    }).select("-video -comment")
    

    if(isLiked){
        await Like.deleteOne(isLiked)

        return res.status(200).json(new ApiResponse(200, {}, "Tweet Not liked success"))
    }

    const like = await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })

    return res.status(201).json(new ApiResponse(201, like, "Tweet liked success"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:req.user._id,
                video:{$exists:true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField: "video",
                foreignField:"_id",
                as:"videoDetails"
            }
        },
        {
            $unwind:"$videoDetails"
        },
        {
            $project:{
                _id:1,
                video:1,
                createdAt:1,
                updatedAt:1,
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, {likedVideos}, "Liked Videos Fetched success"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}