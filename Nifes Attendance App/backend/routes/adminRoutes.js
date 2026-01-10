import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Announce from '../models/Announce.js';
import { calculateUsers } from '../middleware/adminMiddleware.js';

const adminRoute = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(path.dirname(path.dirname(__dirname)), 'frontend');

// GET Pages
adminRoute.get(`/:id/ad-dashboard`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'admin', 'ad-dashboard.html'));
}); 
adminRoute.get(`/:id/ad-services`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'admin', 'ad-services.html'));
});
adminRoute.get(`/:id/ad-announcements`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'admin', 'ad-announcements.html'));
});
adminRoute.get(`/:id/ad-members`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'admin', 'ad-members.html'));
});
adminRoute.get(`/:id/ad-service/details`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'admin', 'service-details.html'));
});
adminRoute.get(`/:id/ad-members/details`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'admin', 'member-details.html'));
});

// Get Admin
adminRoute.get('/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const admin = await Admin.findOne({ admin_id: id });
        if(!admin) return res.status(404).json({ message: 'Admin not found!'});
        res.status(200).json({ message: 'success', admin: admin });
    } catch (err){
        throw new Error(err);        
    }
});

// Logout
adminRoute.post('/:id/logout', async (req, res) => {
    try{
        const id = req.params.id;
        const admin = await Admin.findOneAndUpdate({ admin_id: id }, { isLoggedIn: false }, {new: true, runValidators: true});
        if(!admin) return res.status(404).json({ message: 'Error. Try again!'});
        res.status(200).json({ message: 'Logged Out Successfully.' });
    } catch (err){
        throw new Error(err);        
    }
});


// OVERVIEW
// Today's Service
adminRoute.get('/:id/todayservice', async (req, res) => {
    try{
        const todayDate = new Date().toLocaleDateString('en-NG', {
            weekday: 'short',
            day: '2-digit',
            month: 'short', 
            year: 'numeric'
        });
        const service = await Service.find({ date: todayDate });
        if(!service) return res.status(404).json({ service: null });
        res.status(200).json({ service: service });
    } catch (err){
        throw new Error(err);        
    }
});

// Annoucements
adminRoute.get('/:id/announcements', async (req, res) => {
    try{
        const announcements = await Announce.find().sort({ createdAt: -1 });
        res.status(200).json({ announce: announcements });
    } catch (err){
        throw new Error(err);        
    }
});
// Today's Birthday
adminRoute.get('/:id/birthday2day', async (req, res) => {
    try{
        const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const regex = new RegExp(`${todayDate}, \\d{4}$`);
        const users = await User.find({ dob: regex }).sort({ createdAt: -1 });
        res.status(200).json({ users: users });
    } catch (err){
        throw new Error(err);        
    }
});

// All Services
adminRoute.get('/:id/services', async (req, res) => {
    try{
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json({ services: services });
    } catch (err){
        throw new Error(err);        
    }
});
// One Service
adminRoute.get('/:id/service', async (req, res) => {
    try{
        const servId = req.query.servId;
        const service = await Service.findOne({ id: servId });
        if(!service) return res.status(404).json({ message: 'Service not found!'});
        res.status(200).json({ service: service });
    } catch (err){
        throw new Error(err);        
    }
});
// Search Services
adminRoute.get('/:id/services/:title', async (req, res) => {
    try{
        const title = req.params.title;
        const services = await Service.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 });
        res.status(200).json({ services: services });
    } catch (err){
        throw new Error(err);        
    }
});
// Mark Attendance
adminRoute.post('/:id/mark-attendance', async (req, res) => {
    try{
        const { servId, userId } = req.body;
        // Put userId in Service Attendance Array
        const service = await Service.findOne({ id: servId });
        if(!service) return res.status(404).json({ message: 'Service not found!'});
        if(service.status !== 'active') return res.status(400).json({ message: 'This service is not ACTIVE! Refresh and try again later.'});
        if(service.attendance.includes(userId)) return res.status(400).json({ message: 'You have already marked attendance for this service!'});
        service.attendance.push(userId);
        const saveServ = await service.save();
        if(!saveServ) return res.status(404).json({ message: 'Error occured! Refresh and try again.'});

        // Put servId in User Attended Array
        const user = await User.findOne({ id: userId });
        if(!user) return res.status(404).json({ message: 'User not found!'});    
        if(user.attended.includes(servId)) return res.status(400).json({ message: 'You have already marked attendance for this service!'});
        user.attended.push(servId);            
        const saveUser = await user.save();
        if(!saveUser) return res.status(404).json({ message: 'Error occured! Refresh and try again.'});

        // Calculate the consistency
        calculateUser(userId);
        res.status(200).json({ message: 'Attendance marked successfully!' });
    } catch (err){
        throw new Error(err);        
    }
    
});

// One Announcement
adminRoute.get('/:id/announcement', async (req, res) => {
    try{
        const announceId = req.query.announceId;
        const announce = await Announce.findOne({ id: announceId });
        if(!announce) return res.status(404).json({ message: 'Announcement not found!'});
        res.status(200).json({ announce: announce });
    } catch (err){
        throw new Error(err);        
    }
});
// Search Announcements
adminRoute.get('/:id/announcements/:title', async (req, res) => {
    try{
        const title = req.params.title;
        const announces = await Announce.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 });
        res.status(200).json({ announces: announces });
    } catch (err){
        throw new Error(err);        
    }
});

// All Members
adminRoute.get('/:id/members', async (req, res) => {
    try{
        const { ufamily, uunit, ufaculty } = req.query;
        const family = await User.find({ family: ufamily }).sort({ surname: 1, firstname: 1 });
        const unit = await User.find({ unit: uunit }).sort({ surname: 1, firstname: 1 });
        const faculty = await User.find({ faculty: ufaculty }).sort({ surname: 1, firstname: 1 });
        res.status(200).json({ familyMem: family, unitMem: unit, facultyMem: faculty });
    } catch (err){
        throw new Error(err);        
    }
});
//  Search Members
adminRoute.get('/:id/members/:name', async (req, res) => {
    try{
        const name = req.params.name;
        const members = await User.find({ firstname: { $regex: name, $options: 'i' } }).sort({ surname: 1, firstname: 1 });
        res.status(200).json({ members: members });
    } catch (err){
        throw new Error(err);        
    }
});



// PROFILE PAGE
// Edit Profile
adminRoute.post('/:id/edit-profile', async (req, res) => {
    try{
        const {id, surname, firstname, othername, phone, dob, faculty, dept} = req.body;
        const user = await User.findOne({ id: id });
        if(!user) return res.status(400).json({ message: "User not found!" });

        user.surname = surname;
        user.firstname = firstname;
        user.othername = othername;
        user.phone = phone;
        user.dob = dob;
        user.faculty = faculty;
        user.dept = dept;
        const save = await user.save();
        if(!save) return res.status(404).json({ message: 'Error! Changes not Saved.'});
        res.status(200).json({ message: 'Changes Saved.'});
    } catch (err){
        if(err) throw new Error(err);
        return res.status(500).json({err});
    }
});
// Change Password
adminRoute.post('/:id/change-password', async (req, res) => {
    try {
        const {id, oldpswd, newpswd} = req.body;
        const user = await User.findOne({ id: id });
        if (!user) return res.status(404).json({message: `User not found!`});

        const isMatch = await bcrypt.compare(oldpswd, user.pswd);
        if(!isMatch) return res.status(404).json({message: `Invalid password!`});

        const salt = await bcrypt.genSalt(10);
        const hashpswd = await bcrypt.hash(newpswd, salt);
        user.pswd = hashpswd;
        const save = await user.save();
        if(save) return res.status(200).json({ message: 'Changes Saved.'});
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    }
});


export default adminRoute;   