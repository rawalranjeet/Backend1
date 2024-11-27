import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "ChannelId is Invalid!")
    }

    //to prevent from subscribing to itself
    if(channelId==req.user._id){
        throw new ApiError(400, "You Cannot Subscribe to Yourself")
    }
    
    const isSubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    // if subscribed then we have to unsubscribe and vice versa
    if(isSubscribed){
        await Subscription.deleteOne({
            _id : isSubscribed._id
        })

        return res.status(200).json(new ApiResponse(200, {}, "Channel unsubscribed success!"))
    }

    const toSubscribe = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })  

    return res.status(200).json(new ApiResponse(200, {toSubscribe}, "Channel Subscribed success!"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "subscriberId is Invalid!")
    }

    const user = await User.findById(subscriberId)

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:user._id
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, {subscribers}, "Subscriber fetched success!"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "ChannelId is Invalid!")
    }

    const user = await User.findById(channelId)

    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber:user._id
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, {channels}, "Channel fetched success!"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}