import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = 1, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const user = await User.findById(userId)

    const searchFilter = {};
    
    if (query) {
        searchFilter.$or = [
            { title: { $regex: query, $options: 'i' } },  // search in title
            { description: { $regex: query, $options: 'i' } } // search in description
        ];
    }

    if (userId && isValidObjectId(userId)) {
        searchFilter.owner = user._id // filter by userId
    }

    

    // get all the videos by all user
    const videos = await Video.aggregate([
        {
            $match:searchFilter
        },
        {
            $sort:{
                [sortBy]:Number(sortType)
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
          $limit:limit          
        }
    ])

    return res.status(200).json(new ApiResponse(200, {videos}, "All Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || title.trim()===""){
        throw new ApiError(400, "Title is required")
    }
   

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    
    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "Video and thumbnail are required")
    }

    
    const videoResponse = await uploadOnCloudinary(videoLocalPath)
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoResponse){
        throw new ApiError(400,"videoResponse not found!")
    }

    const video = await Video.create({
        title,
        description: description || "",
        videoFile: videoResponse.url,
        thumbnail:thumbnailResponse.url || "",
        duration:videoResponse.duration,
        owner:req.user._id
    })

    return res.status(201).json(new ApiResponse(200, {video}, "Video publish success!"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "VideoID invalid")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video does not exists")
    }

    return res.status(200).json( new ApiResponse(200, video, "Video fetched by id success!"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = await Video.findById(videoId).select("-duration -videoFile -views -isPublished")

    if(!video){
        throw new ApiError(404, "Video does not exists")
    }

    const userId = req.user._id
    const ownerId = video.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(401, "Action not allowed")
    }

    const {title, description} = req.body

    
    
    const thumbnailLocalPath = req.file?.path
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath)
   
    if(!title && !description && !thumbnailResponse){
        throw new ApiError(400, "Nothing to Update")
    }


    const updatedVideo =  await Video.findByIdAndUpdate( videoId, {
            $set:{
                title : (title && title.trim()) || video.title,
                description: (description && description.trim()) || video.description,
                thumbnail: (thumbnailResponse && thumbnailResponse.url) || video.thumbnail
            }
        }, {new :true}
    ).select("-duration -owner -videoFile -views -isPublished")

    return res.status(202).json(new ApiResponse(202, {video, updatedVideo}, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video does not exists")
    }

    const userId = req.user._id
    const ownerId = video.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(401, "Action not allowed")
    }

    await Video.deleteOne({_id:videoId})

    return res.status(200).json(new ApiResponse(200, {}, "Video Delete success!"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video does not exists")
    }

    const userId = req.user._id
    const ownerId = video.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(401, "Action not allowed")
    }
    const isPublished = video.isPublished;

    const togglePublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished: !isPublished
            }
        },{new:true}
    ).select("-title -owner -description -videoFile -thumbnail -duration -views")

    return res.status(202).json(new ApiResponse(202, togglePublish, "Toggle publish success!"))
})

const watchVideo = asyncHandler(async(req, res) =>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video does not exists")
    }

    const watched = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                views:video.views + 1
            }
        },{new: true}
    )

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet:{
                watchHistory:videoId
            }
        },{new:true}

    )

    return res.status(200).json(new ApiResponse(200, watched, "watch video success"))
    
})




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    watchVideo
}
