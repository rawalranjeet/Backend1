import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    let {content} = req.body
    content = content.trim()

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content:content,
        owner: req.user._id
    })

    return res.status(201).json( new ApiResponse(200, {tweet}, "Tweet Created success!"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "userId Invalid")
    }

    const user = await User.findById(userId)

    const userTweets = await Tweet.aggregate([
        {
            $match:{
                owner:user._id
            }
        }
    ])

    return res.status(200).json( new ApiResponse(200, {userTweets}, "User Tweets Fetched success!"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId")
    }
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }
    
    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "tweet does not exists")
    }

    const userId = req.user._id
    const ownerId = tweet.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(401, "Action not allowed")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {new:true}
    )

    return res.status(202).json(new ApiResponse(202, {tweet, updatedTweet}, "Tweet update success!"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params


    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "tweet does not exists")
    }

    const userId = req.user._id
    const ownerId = tweet.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(401, "Action not allowed")
    }


    await Tweet.deleteOne({_id:tweetId})

    return res.status(200).json(new ApiResponse(200, {}, "Tweet Delete success!"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
