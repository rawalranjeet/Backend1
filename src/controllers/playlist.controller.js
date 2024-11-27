import mongoose, {isValidObjectId, Schema} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if(!name || name.trim()===""){
        throw new ApiError(400, "name is Requried")
    }

    const existedPlaylist = await Playlist.findOne({
        $and:[{name}, {owner:req.user._id}]
    })

    if(existedPlaylist){
        throw new ApiError(400, "playlist with same name already exists")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description || "",
        owner:req.user._id
    })

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid userId")
    }


    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, {playlists}, "user playlists fetched success"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlistId")
    } 
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist does not exists")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetch success"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlistId or VideoID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(400, "Playlist does not exists")
    }


    const userId = req.user._id;
    const ownerId = playlist.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(400, "Action not allowed!")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos:videoId
            }
        },{new:true}
    )

    return res.status(202).json(new ApiResponse(202, {updatedPlaylist}, "Video added to playlist successfully"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlistId or VideoID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(400, "Playlist does not exists")
    }

    const userId = req.user._id;
    const ownerId = playlist.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(400, "Action not allowed!")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }
        },{new : true}
    )

    return res.status(202).json(new ApiResponse(202, {updatedPlaylist}, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(400, "Playlist does not exists")
    }

    const userId = req.user._id;
    const ownerId = playlist.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(400, "Action not allowed!")
    }

    await Playlist.deleteOne(playlist)

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId).select("-videos")

    if(!playlist){
        throw new ApiError(400, "Playlist does not exists")
    }

    const userId = req.user._id
    const ownerId = playlist.owner

    if(userId.toString() !== ownerId.toString()){
        throw new ApiError(401, "Action not allowed")
    }

    if(!name && !description){
        throw new ApiError(400, "Nothing to update")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set:{
            name : (name && name.trim()) || playlist.title,
            description: (description && description.trim()) || playlist.description
        }
    },{new : true}).select("-videos")

    return res.status(202).json(new ApiResponse(202, {playlist , updatedPlaylist}, "Playlist Updated successfully"))

    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
