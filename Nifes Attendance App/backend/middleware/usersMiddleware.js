import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Service from '../models/Service.js';

const userRoute = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(path.dirname(path.dirname(__dirname)), 'frontend');

export async function calculateUser(userId) {
    try{
        const user = await User.findOne({id: userId});
        if(!user) return false;
        const services = await Service.find({}, {id: true});
        
        const attend = user.attended.length;
        const allServ = services.length;

        const consist = Math.round(((attend / allServ) * 100) * 100) / 100;
        user.consistency = consist;
        user.badge = calcBadge(attend, consist, user.badge, user.unit);
        await user.save();
    } catch (err){
        throw new Error(err);
    }    
}

function calcBadge(att, consist, ubadge, unit){
    if(ubadge === 'devotee'){
        return 'devotee';
    }else if(ubadge === 'acsteward' && att >= 18 && consist >= 75){
        return 'devotee';
    } else if(ubadge === 'steward' && att >= 15 && consist >= 75){
        return 'acsteward';
    } else if(unit !== 'None' && att >= 9 && consist >= 50){
        return 'steward';
    } else if(ubadge === 'member' && att >= 6 && consist >= 50){
        return 'acmember';
    } else {
        return 'member';
    }
} 