import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const replySchema = new Schema(
    {
        content:{
            type : String,
            required:true
        },
        comment:{
            type:mongoose.Types.ObjectId,
            ref:"Comment"
        },
        owner:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true
    }
)

replySchema.plugin(mongooseAggregatePaginate)

export const Reply = mongoose.model("Reply", replySchema)